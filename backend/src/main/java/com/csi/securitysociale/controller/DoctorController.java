package com.csi.securitysociale.controller;

import com.csi.securitysociale.entity.Doctor;
import com.csi.securitysociale.service.DoctorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@Tag(name = "Doctors", description = "Endpoints pour la gestion des médecins")
public class DoctorController {

    @Autowired
    private DoctorService doctorService;

    @GetMapping
    @Operation(summary = "Récupérer tous les médecins")
    public ResponseEntity<List<Doctor>> getAllDoctors() {
        return ResponseEntity.ok(doctorService.getAllDoctors());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Récupérer un médecin par son ID")
    public ResponseEntity<Doctor> getDoctorById(@PathVariable Long id) {
        return ResponseEntity.ok(doctorService.getDoctorById(id));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Récupérer le profil médecin d'un ID utilisateur")
    public ResponseEntity<Doctor> getDoctorByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(doctorService.getDoctorByUserId(userId));
    }

    @GetMapping("/specialty/{specialty}")
    @Operation(summary = "Filtrer les médecins par spécialité (GENERALISTE ou SPECIALISTE)")
    public ResponseEntity<List<Doctor>> getDoctorsBySpecialty(@PathVariable String specialty) {
        return ResponseEntity.ok(doctorService.getDoctorsBySpecialty(specialty));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_ASSUREUR', 'ROLE_MEDECIN')")
    @Operation(summary = "Mettre à jour le profil d'un médecin")
    public ResponseEntity<Doctor> updateDoctor(@PathVariable Long id, @RequestBody Doctor details) {
        return ResponseEntity.ok(doctorService.updateDoctor(id, details));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ASSUREUR')")
    @Operation(summary = "Supprimer un médecin")
    public ResponseEntity<?> deleteDoctor(@PathVariable Long id) {
        doctorService.deleteDoctor(id);
        return ResponseEntity.ok("Médecin supprimé avec succès.");
    }
}
