package com.csi.securitysociale.controller;

import com.csi.securitysociale.dto.RegisterRequest;
import com.csi.securitysociale.entity.User;
import com.csi.securitysociale.exception.ResourceNotFoundException;
import com.csi.securitysociale.repository.UserRepository;
import com.csi.securitysociale.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin", description = "Endpoints pour le Super Admin (Gestion des Assureurs)")
@PreAuthorize("hasRole('ROLE_ADMIN')")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthService authService;

    @GetMapping("/assureurs")
    @Operation(summary = "Lister tous les assureurs")
    public ResponseEntity<List<User>> getAllAssureurs() {
        List<User> assureurs = userRepository.findByRolesContaining("ROLE_ASSUREUR")
            .stream()
            // Retirer le mot de passe de la réponse par sécurité (ou utiliser un DTO, ici on met à null pour l'instant)
            .map(u -> {
                User safeUser = new User();
                safeUser.setId(u.getId());
                safeUser.setEmail(u.getEmail());
                safeUser.setFirstName(u.getFirstName());
                safeUser.setLastName(u.getLastName());
                safeUser.setGender(u.getGender());
                safeUser.setRoles(u.getRoles());
                return safeUser;
            })
            .collect(Collectors.toList());
        return ResponseEntity.ok(assureurs);
    }

    @PostMapping("/assureurs")
    @Operation(summary = "Créer un nouveau compte assureur")
    public ResponseEntity<?> createAssureur(@Valid @RequestBody RegisterRequest request) {
        request.setRole("ASSUREUR");
        User newAssureur = authService.registerUser(request);
        return ResponseEntity.ok("Assureur créé avec succès : " + newAssureur.getEmail());
    }

    @DeleteMapping("/assureurs/{id}")
    @Operation(summary = "Supprimer un assureur")
    public ResponseEntity<?> deleteAssureur(@PathVariable Long id) {
        User assureur = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assureur non trouvé"));
        if (!assureur.getRoles().contains("ROLE_ASSUREUR")) {
            return ResponseEntity.badRequest().body("Cet utilisateur n'est pas un assureur.");
        }
        userRepository.delete(assureur);
        return ResponseEntity.ok("Assureur supprimé avec succès.");
    }
}
