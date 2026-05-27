package com.csi.securitysociale.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "doctors")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    @Column(unique = true, nullable = false, length = 50)
    private String matricule;

    @Column(nullable = false, length = 50)
    private String specialty; // 'GENERALISTE' or 'SPECIALISTE'

    @Column(name = "is_insured")
    @Builder.Default
    private Boolean isInsured = false;
}
