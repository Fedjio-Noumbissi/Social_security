package com.csi.securitysociale.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "prescription_specialists")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionSpecialist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "prescription_id", nullable = false)
    @JsonIgnore
    private Prescription prescription;

    @Column(name = "specialty_needed", nullable = false, length = 50)
    private String specialtyNeeded; // Usually 'SPECIALISTE'

    @Column(nullable = false, length = 255)
    private String reason;

    @ManyToOne
    @JoinColumn(name = "referred_doctor_id")
    private Doctor referredDoctor; // The specific referred specialist if chosen
}
