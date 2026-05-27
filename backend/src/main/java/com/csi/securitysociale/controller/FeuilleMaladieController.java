package com.csi.securitysociale.controller;

import com.csi.securitysociale.entity.FeuilleMaladie;
import com.csi.securitysociale.exception.ResourceNotFoundException;
import com.csi.securitysociale.repository.FeuilleMaladieRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feuilles-maladie")
@Tag(name = "FeuilleMaladie", description = "Endpoints pour la gestion des feuilles de maladie")
public class FeuilleMaladieController {

    @Autowired
    private FeuilleMaladieRepository feuilleMaladieRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_ASSUREUR', 'ROLE_MEDECIN')")
    @Operation(summary = "Lister toutes les feuilles de maladie")
    public ResponseEntity<List<FeuilleMaladie>> getAll() {
        return ResponseEntity.ok(feuilleMaladieRepository.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_ASSUREUR', 'ROLE_MEDECIN', 'ROLE_PATIENT')")
    @Operation(summary = "Récupérer une feuille de maladie par ID")
    public ResponseEntity<FeuilleMaladie> getById(@PathVariable Long id) {
        FeuilleMaladie fm = feuilleMaladieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feuille de maladie non trouvée avec l'id : " + id));
        return ResponseEntity.ok(fm);
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ROLE_ASSUREUR')")
    @Operation(summary = "Filtrer les feuilles de maladie par statut (EN_ATTENTE, VALIDEE, REFUSEE)")
    public ResponseEntity<List<FeuilleMaladie>> getByStatus(@PathVariable String status) {
        return ResponseEntity.ok(feuilleMaladieRepository.findByStatus(status.toUpperCase()));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('ROLE_ASSUREUR', 'ROLE_MEDECIN', 'ROLE_PATIENT')")
    @Operation(summary = "Lister les feuilles de maladie d'un patient")
    public ResponseEntity<List<FeuilleMaladie>> getByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(feuilleMaladieRepository.findByPatientId(patientId));
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAnyRole('ROLE_ASSUREUR', 'ROLE_MEDECIN')")
    @Operation(summary = "Lister les feuilles de maladie d'un médecin")
    public ResponseEntity<List<FeuilleMaladie>> getByDoctor(@PathVariable Long doctorId) {
        return ResponseEntity.ok(feuilleMaladieRepository.findByDoctorId(doctorId));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ROLE_ASSUREUR')")
    @Operation(summary = "Mettre à jour le statut d'une feuille de maladie (VALIDEE ou REFUSEE)")
    public ResponseEntity<FeuilleMaladie> updateStatus(@PathVariable Long id, @RequestParam String status) {
        FeuilleMaladie fm = feuilleMaladieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feuille de maladie non trouvée avec l'id : " + id));
        String s = status.toUpperCase();
        if (!s.equals("VALIDEE") && !s.equals("REFUSEE") && !s.equals("EN_ATTENTE")) {
            return ResponseEntity.badRequest().build();
        }
        fm.setStatus(s);
        return ResponseEntity.ok(feuilleMaladieRepository.save(fm));
    }
}
