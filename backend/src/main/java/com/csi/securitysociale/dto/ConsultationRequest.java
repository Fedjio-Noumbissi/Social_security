package com.csi.securitysociale.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ConsultationRequest {
    private Long patientId;
    private LocalDateTime date;
    private String motif;
    private String observations;

    // Prescriptions (Medicaments)
    private List<MedicamentPrescription> medicaments;

    // Specialist Referral (Optional)
    private String specialtyNeeded;
    private String specialistReason;
    private Long referredDoctorId;

    @Data
    public static class MedicamentPrescription {
        private String name;
        private String dosage;
        private Integer durationDays;
    }
}
