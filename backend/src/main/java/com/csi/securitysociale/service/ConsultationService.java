package com.csi.securitysociale.service;

import com.csi.securitysociale.dto.ConsultationRequest;
import com.csi.securitysociale.entity.*;
import com.csi.securitysociale.exception.ResourceNotFoundException;
import com.csi.securitysociale.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class ConsultationService {

    @Autowired
    private ConsultationRepository consultationRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private FeuilleMaladieRepository feuilleMaladieRepository;

    @Autowired
    private RemboursementRepository remboursementRepository;

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    public List<Consultation> getAllConsultations() {
        return consultationRepository.findAll();
    }

    public Consultation getConsultationById(Long id) {
        return consultationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation non trouvée avec l'id : " + id));
    }

    public List<Consultation> getConsultationsByPatient(Long patientId) {
        return consultationRepository.findByPatientIdOrderByDateDesc(patientId);
    }

    public List<Consultation> getConsultationsByDoctor(Long doctorId) {
        return consultationRepository.findByDoctorIdOrderByDateDesc(doctorId);
    }

    @Transactional
    public Consultation createConsultation(ConsultationRequest request, Long doctorUserId) {
        // 1. Fetch Doctor and Patient
        Doctor doctor = doctorRepository.findByUserId(doctorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Profil médecin introuvable pour ce compte !"));

        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient introuvable !"));

        // 2. Create Consultation
        Consultation consultation = Consultation.builder()
                .doctor(doctor)
                .patient(patient)
                .date(request.getDate() != null ? request.getDate() : LocalDateTime.now())
                .motif(request.getMotif())
                .observations(request.getObservations())
                .build();

        Consultation savedConsultation = consultationRepository.save(consultation);

        // 3. Auto-generate Feuille de Maladie
        FeuilleMaladie feuille = FeuilleMaladie.builder()
                .consultation(savedConsultation)
                .date(LocalDateTime.now())
                .status("EN_ATTENTE")
                .build();

        FeuilleMaladie savedFeuille = feuilleMaladieRepository.save(feuille);

        // 4. Calculate Remboursement
        // Business Rules:
        // - Generalist: 100% refund (Standard Consultation Fee = 25.0 €)
        // - Specialist: 80% refund (Standard Consultation Fee = 50.0 €)
        double fee = "GENERALISTE".equals(doctor.getSpecialty()) ? 25.0 : 50.0;
        int rate = "GENERALISTE".equals(doctor.getSpecialty()) ? 100 : 80;
        double refundAmount = fee * (rate / 100.0);

        Remboursement remboursement = Remboursement.builder()
                .feuilleMaladie(savedFeuille)
                .amount(refundAmount)
                .rate(rate)
                .method("CASH") // Default is CASH, can be updated later by Assureur with RIB
                .status("EN_ATTENTE")
                .build();

        remboursementRepository.save(remboursement);

        // 5. Handle Prescriptions if present
        boolean hasMedicaments = request.getMedicaments() != null && !request.getMedicaments().isEmpty();
        boolean hasSpecialistReferral = request.getSpecialtyNeeded() != null && !request.getSpecialtyNeeded().isBlank();

        if (hasMedicaments || hasSpecialistReferral) {
            Prescription prescription = Prescription.builder()
                    .consultation(savedConsultation)
                    .medicaments(new ArrayList<>())
                    .specialists(new ArrayList<>())
                    .build();

            Prescription savedPrescription = prescriptionRepository.save(prescription);

            if (hasMedicaments) {
                for (ConsultationRequest.MedicamentPrescription medReq : request.getMedicaments()) {
                    PrescriptionMedicament med = PrescriptionMedicament.builder()
                            .prescription(savedPrescription)
                            .name(medReq.getName())
                            .dosage(medReq.getDosage())
                            .durationDays(medReq.getDurationDays())
                            .build();
                    savedPrescription.getMedicaments().add(med);
                }
            }

            if (hasSpecialistReferral) {
                Doctor referredDoctor = null;
                if (request.getReferredDoctorId() != null) {
                    referredDoctor = doctorRepository.findById(request.getReferredDoctorId()).orElse(null);
                }

                PrescriptionSpecialist spec = PrescriptionSpecialist.builder()
                        .prescription(savedPrescription)
                        .specialtyNeeded(request.getSpecialtyNeeded())
                        .reason(request.getSpecialistReason())
                        .referredDoctor(referredDoctor)
                        .build();
                savedPrescription.getSpecialists().add(spec);
            }

            prescriptionRepository.save(savedPrescription);
        }

        return savedConsultation;
    }
}
