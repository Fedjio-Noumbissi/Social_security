package com.csi.securitysociale.repository;

import com.csi.securitysociale.entity.FeuilleMaladie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeuilleMaladieRepository extends JpaRepository<FeuilleMaladie, Long> {
    Optional<FeuilleMaladie> findByConsultationId(Long consultationId);
    
    @Query("SELECT f FROM FeuilleMaladie f WHERE f.consultation.patient.id = :patientId ORDER BY f.date DESC")
    List<FeuilleMaladie> findByPatientId(@Param("patientId") Long patientId);

    @Query("SELECT f FROM FeuilleMaladie f WHERE f.consultation.doctor.id = :doctorId ORDER BY f.date DESC")
    List<FeuilleMaladie> findByDoctorId(@Param("doctorId") Long doctorId);

    List<FeuilleMaladie> findByStatus(String status);
}
