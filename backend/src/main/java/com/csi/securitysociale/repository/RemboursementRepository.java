package com.csi.securitysociale.repository;

import com.csi.securitysociale.entity.Remboursement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RemboursementRepository extends JpaRepository<Remboursement, Long> {
    Optional<Remboursement> findByFeuilleMaladieId(Long feuilleMaladieId);

    @Query("SELECT r FROM Remboursement r WHERE r.feuilleMaladie.consultation.patient.id = :patientId ORDER BY r.feuilleMaladie.date DESC")
    List<Remboursement> findByPatientId(@Param("patientId") Long patientId);

    @Query("SELECT r FROM Remboursement r WHERE r.feuilleMaladie.consultation.doctor.id = :doctorId ORDER BY r.feuilleMaladie.date DESC")
    List<Remboursement> findByDoctorId(@Param("doctorId") Long doctorId);

    List<Remboursement> findByStatus(String status);

    @Query("SELECT SUM(r.amount) FROM Remboursement r WHERE r.status = 'EFFECTUE'")
    Double sumTotalRemboursed();

    @Query("SELECT SUM(r.amount) FROM Remboursement r WHERE r.feuilleMaladie.consultation.patient.id = :patientId AND r.status = 'EFFECTUE'")
    Double sumTotalRemboursedByPatient(@Param("patientId") Long patientId);

    @Query("SELECT SUM(r.amount) FROM Remboursement r WHERE r.feuilleMaladie.consultation.doctor.id = :doctorId AND r.status = 'EFFECTUE'")
    Double sumTotalRemboursedByDoctor(@Param("doctorId") Long doctorId);
}
