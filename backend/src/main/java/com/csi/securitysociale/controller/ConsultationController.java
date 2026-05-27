package com.csi.securitysociale.controller;

import com.csi.securitysociale.dto.ConsultationRequest;
import com.csi.securitysociale.entity.Consultation;
import com.csi.securitysociale.security.UserPrincipal;
import com.csi.securitysociale.service.ConsultationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/consultations")
@Tag(name = "Consultations", description = "Endpoints pour enregistrer et consulter les actes médicaux")
public class ConsultationController {

    @Autowired
    private ConsultationService consultationService;

    @GetMapping
    @PreAuthorize("hasRole('ROLE_ASSUREUR')")
    @Operation(summary = "Récupérer toutes les consultations (Réservé Assureur)")
    public ResponseEntity<List<Consultation>> getAllConsultations() {
        return ResponseEntity.ok(consultationService.getAllConsultations());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_ASSUREUR', 'ROLE_MEDECIN', 'ROLE_PATIENT')")
    @Operation(summary = "Consulter les détails d'une consultation spécifique")
    public ResponseEntity<Consultation> getConsultationById(@PathVariable Long id) {
        return ResponseEntity.ok(consultationService.getConsultationById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ROLE_MEDECIN')")
    @Operation(summary = "Enregistrer une nouvelle consultation avec ordonnance et feuille de soins automatique")
    public ResponseEntity<Consultation> createConsultation(
            @RequestBody ConsultationRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(consultationService.createConsultation(request, currentUser.getId()));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('ROLE_ASSUREUR', 'ROLE_MEDECIN', 'ROLE_PATIENT')")
    @Operation(summary = "Lister les consultations d'un patient particulier")
    public ResponseEntity<List<Consultation>> getConsultationsByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(consultationService.getConsultationsByPatient(patientId));
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAnyRole('ROLE_ASSUREUR', 'ROLE_MEDECIN')")
    @Operation(summary = "Lister les consultations effectuées par un médecin particulier")
    public ResponseEntity<List<Consultation>> getConsultationsByDoctor(@PathVariable Long doctorId) {
        return ResponseEntity.ok(consultationService.getConsultationsByDoctor(doctorId));
    }
}
