package com.csi.securitysociale.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "feuilles_maladie")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeuilleMaladie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "consultation_id", nullable = false)
    private Consultation consultation;

    @Column(nullable = false)
    private LocalDateTime date;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String status = "EN_ATTENTE"; // 'EN_ATTENTE', 'VALIDEE', 'REFUSEE'
}
