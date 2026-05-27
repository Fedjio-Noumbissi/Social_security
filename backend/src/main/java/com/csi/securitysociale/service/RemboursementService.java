package com.csi.securitysociale.service;

import com.csi.securitysociale.dto.RemboursementProcessRequest;
import com.csi.securitysociale.entity.FeuilleMaladie;
import com.csi.securitysociale.entity.Remboursement;
import com.csi.securitysociale.exception.BadRequestException;
import com.csi.securitysociale.exception.ResourceNotFoundException;
import com.csi.securitysociale.repository.FeuilleMaladieRepository;
import com.csi.securitysociale.repository.RemboursementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class RemboursementService {

    @Autowired
    private RemboursementRepository remboursementRepository;

    @Autowired
    private FeuilleMaladieRepository feuilleMaladieRepository;

    public List<Remboursement> getAllRemboursements() {
        return remboursementRepository.findAll();
    }

    public Remboursement getRemboursementById(Long id) {
        return remboursementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Remboursement non trouvé avec l'id : " + id));
    }

    public List<Remboursement> getRemboursementsByPatient(Long patientId) {
        return remboursementRepository.findByPatientId(patientId);
    }

    @Transactional
    public Remboursement processRemboursement(Long id, RemboursementProcessRequest request) {
        Remboursement remboursement = getRemboursementById(id);

        if ("EFFECTUE".equals(remboursement.getStatus())) {
            throw new BadRequestException("Ce remboursement a déjà été traité et effectué !");
        }

        String method = request.getMethod().toUpperCase();
        if (!"VIREMENT".equals(method) && !"CASH".equals(method)) {
            throw new BadRequestException("Le mode de remboursement doit être soit VIREMENT soit CASH !");
        }

        if ("VIREMENT".equals(method)) {
            if (request.getBankAccount() == null || request.getBankAccount().isBlank()) {
                throw new BadRequestException("Le numéro de compte (RIB) est obligatoire pour un remboursement par virement !");
            }
            remboursement.setBankAccount(request.getBankAccount());
        } else {
            remboursement.setBankAccount(null); // Clear RIB if Cash
        }

        remboursement.setMethod(method);
        remboursement.setStatus("EFFECTUE");

        // Validate and update the associated Feuille de Maladie status
        FeuilleMaladie feuille = remboursement.getFeuilleMaladie();
        feuille.setStatus("VALIDEE");
        feuilleMaladieRepository.save(feuille);

        return remboursementRepository.save(remboursement);
    }

    public Map<String, Object> getFinancialSummary() {
        Double totalRemboursed = remboursementRepository.sumTotalRemboursed();
        List<Remboursement> all = remboursementRepository.findAll();
        
        long pendingCount = all.stream().filter(r -> "EN_ATTENTE".equals(r.getStatus())).count();
        long completedCount = all.stream().filter(r -> "EFFECTUE".equals(r.getStatus())).count();
        
        double pendingAmount = all.stream()
                .filter(r -> "EN_ATTENTE".equals(r.getStatus()))
                .mapToDouble(Remboursement::getAmount)
                .sum();

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalRemboursed", totalRemboursed != null ? totalRemboursed : 0.0);
        summary.put("pendingAmount", pendingAmount);
        summary.put("pendingCount", pendingCount);
        summary.put("completedCount", completedCount);
        summary.put("totalCount", all.size());

        return summary;
    }
}
