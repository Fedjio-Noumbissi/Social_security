package com.csi.securitysociale.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "remboursements")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Remboursement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "feuille_maladie_id", nullable = false)
    private FeuilleMaladie feuilleMaladie;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private Integer rate; // 100 or 80

    @Column(nullable = false, length = 50)
    private String method; // 'VIREMENT' or 'CASH'

    @Column(name = "bank_account", length = 100)
    private String bankAccount; // RIB (optional)

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String status = "EN_ATTENTE"; // 'EN_ATTENTE', 'EFFECTUE'
}
