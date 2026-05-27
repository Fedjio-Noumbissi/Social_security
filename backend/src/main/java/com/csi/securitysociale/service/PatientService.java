package com.csi.securitysociale.service;

import com.csi.securitysociale.entity.*;
import com.csi.securitysociale.exception.BadRequestException;
import com.csi.securitysociale.exception.ResourceNotFoundException;
import com.csi.securitysociale.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PatientService {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private ConsultationRepository consultationRepository;

    @Autowired
    private FeuilleMaladieRepository feuilleMaladieRepository;

    @Autowired
    private RemboursementRepository remboursementRepository;

    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    public Patient getPatientById(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient non trouvé avec l'id : " + id));
    }

    public Patient getPatientByUserId(Long userId) {
        return patientRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient non trouvé avec le user_id : " + userId));
    }

    @Transactional
    public Patient assignMedecinTraitant(Long patientId, Long doctorId) {
        Patient patient = getPatientById(patientId);
        if (doctorId == null) {
            patient.setMedecinTraitant(null);
            return patientRepository.save(patient);
        }

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Médecin non trouvé avec l'id : " + doctorId));

        if (!"GENERALISTE".equals(doctor.getSpecialty())) {
            throw new BadRequestException("Un médecin traitant doit obligatoirement être un médecin Généraliste !");
        }

        patient.setMedecinTraitant(doctor);
        return patientRepository.save(patient);
    }

    @Transactional
    public Patient updatePatient(Long id, Patient details) {
        Patient patient = getPatientById(id);
        patient.setEmergencyContact(details.getEmergencyContact());
        
        if (details.getSocialSecurityNumber() != null && !details.getSocialSecurityNumber().isBlank() 
                && !details.getSocialSecurityNumber().equals(patient.getSocialSecurityNumber())) {
            if (patientRepository.existsBySocialSecurityNumber(details.getSocialSecurityNumber())) {
                throw new BadRequestException("Ce numéro de sécurité sociale est déjà utilisé !");
            }
            patient.setSocialSecurityNumber(details.getSocialSecurityNumber());
        }

        if (details.getUser() != null) {
            User user = patient.getUser();
            user.setFirstName(details.getUser().getFirstName());
            user.setLastName(details.getUser().getLastName());
            user.setGender(details.getUser().getGender());
        }

        return patientRepository.save(patient);
    }

    @Transactional
    public void deletePatient(Long id) {
        Patient patient = getPatientById(id);
        patientRepository.delete(patient);
    }

    public Map<String, Object> getPatientHistory(Long patientId) {
        Patient patient = getPatientById(patientId);
        List<Consultation> consultations = consultationRepository.findByPatientIdOrderByDateDesc(patientId);
        List<FeuilleMaladie> feuilles = feuilleMaladieRepository.findByPatientId(patientId);
        List<Remboursement> remboursements = remboursementRepository.findByPatientId(patientId);

        Map<String, Object> history = new HashMap<>();
        history.put("patient", patient);
        history.put("consultations", consultations);
        history.put("feuillesMaladie", feuilles);
        history.put("remboursements", remboursements);

        return history;
    }
}
