package com.csi.securitysociale.controller;

import com.csi.securitysociale.dto.RemboursementProcessRequest;
import com.csi.securitysociale.entity.Remboursement;
import com.csi.securitysociale.service.RemboursementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/remboursements")
@Tag(name = "Remboursements", description = "Endpoints pour traiter les feuilles de maladie et les remboursements")
public class RemboursementController {

    @Autowired
    private RemboursementService remboursementService;

    @GetMapping
    @PreAuthorize("hasRole('ROLE_ASSUREUR')")
    @Operation(summary = "Lister toutes les demandes de remboursement (Réservé Assureur)")
    public ResponseEntity<List<Remboursement>> getAllRemboursements() {
        return ResponseEntity.ok(remboursementService.getAllRemboursements());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_ASSUREUR', 'ROLE_PATIENT')")
    @Operation(summary = "Consulter un remboursement spécifique")
    public ResponseEntity<Remboursement> getRemboursementById(@PathVariable Long id) {
        return ResponseEntity.ok(remboursementService.getRemboursementById(id));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('ROLE_ASSUREUR', 'ROLE_PATIENT')")
    @Operation(summary = "Lister tous les remboursements d'un patient particulier")
    public ResponseEntity<List<Remboursement>> getRemboursementsByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(remboursementService.getRemboursementsByPatient(patientId));
    }

    @PutMapping("/{id}/process")
    @PreAuthorize("hasRole('ROLE_ASSUREUR')")
    @Operation(summary = "Valider et effectuer le paiement d'un remboursement (Virement avec RIB, ou Cash)")
    public ResponseEntity<Remboursement> processRemboursement(
            @PathVariable Long id, 
            @RequestBody RemboursementProcessRequest request) {
        return ResponseEntity.ok(remboursementService.processRemboursement(id, request));
    }

    @GetMapping("/summary")
    @PreAuthorize("hasRole('ROLE_ASSUREUR')")
    @Operation(summary = "Synthèse financière générale pour les statistiques globales")
    public ResponseEntity<Map<String, Object>> getFinancialSummary() {
        return ResponseEntity.ok(remboursementService.getFinancialSummary());
    }
}
