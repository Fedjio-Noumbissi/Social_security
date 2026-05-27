package com.csi.securitysociale.controller;

import com.csi.securitysociale.entity.Patient;
import com.csi.securitysociale.service.PatientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/patients")
@Tag(name = "Patients", description = "Endpoints pour la gestion des assurés / patients")
public class PatientController {

    @Autowired
    private PatientService patientService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_ASSUREUR', 'ROLE_MEDECIN')")
    @Operation(summary = "Récupérer tous les patients assurés")
    public ResponseEntity<List<Patient>> getAllPatients() {
        return ResponseEntity.ok(patientService.getAllPatients());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_ASSUREUR', 'ROLE_MEDECIN', 'ROLE_PATIENT')")
    @Operation(summary = "Récupérer un patient par son ID")
    public ResponseEntity<Patient> getPatientById(@PathVariable Long id) {
        return ResponseEntity.ok(patientService.getPatientById(id));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('ROLE_ASSUREUR', 'ROLE_MEDECIN', 'ROLE_PATIENT')")
    @Operation(summary = "Récupérer le profil patient par son ID utilisateur")
    public ResponseEntity<Patient> getPatientByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(patientService.getPatientByUserId(userId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_ASSUREUR', 'ROLE_PATIENT')")
    @Operation(summary = "Mettre à jour les informations d'un patient")
    public ResponseEntity<Patient> updatePatient(@PathVariable Long id, @RequestBody Patient details) {
        return ResponseEntity.ok(patientService.updatePatient(id, details));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ASSUREUR')")
    @Operation(summary = "Supprimer un patient")
    public ResponseEntity<?> deletePatient(@PathVariable Long id) {
        patientService.deletePatient(id);
        return ResponseEntity.ok("Patient supprimé avec succès.");
    }

    @PutMapping("/{id}/assign-doctor")
    @PreAuthorize("hasAnyRole('ROLE_ASSUREUR', 'ROLE_PATIENT')")
    @Operation(summary = "Attribuer ou modifier le médecin traitant d'un patient (Généraliste uniquement)")
    public ResponseEntity<Patient> assignMedecinTraitant(
            @PathVariable Long id, 
            @RequestParam(required = false) Long doctorId) {
        return ResponseEntity.ok(patientService.assignMedecinTraitant(id, doctorId));
    }

    @GetMapping("/{id}/history")
    @PreAuthorize("hasAnyRole('ROLE_ASSUREUR', 'ROLE_MEDECIN', 'ROLE_PATIENT')")
    @Operation(summary = "Récupérer l'historique médical complet d'un patient (Consultations, Ordonnances, Remboursements)")
    public ResponseEntity<Map<String, Object>> getPatientHistory(@PathVariable Long id) {
        return ResponseEntity.ok(patientService.getPatientHistory(id));
    }
}
