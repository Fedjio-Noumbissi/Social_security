package com.csi.securitysociale.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "patients")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    @Column(name = "social_security_number", unique = true, nullable = false, length = 50)
    private String socialSecurityNumber;

    @Column(name = "emergency_contact", length = 100)
    private String emergencyContact;

    @ManyToOne
    @JoinColumn(name = "medecin_traitant_id")
    private Doctor medecinTraitant; // Must be a Generalist
}
