package com.csi.securitysociale.controller;

import com.csi.securitysociale.dto.JwtAuthenticationResponse;
import com.csi.securitysociale.dto.LoginRequest;
import com.csi.securitysociale.dto.RegisterRequest;
import com.csi.securitysociale.entity.User;
import com.csi.securitysociale.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Endpoints pour l'inscription et la connexion")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Connexion d'un utilisateur et génération de token JWT")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        JwtAuthenticationResponse jwtResponse = authService.authenticateUser(loginRequest);
        return ResponseEntity.ok(jwtResponse);
    }

    @PostMapping("/register")
    @Operation(summary = "Inscription d'un nouvel utilisateur (Assuré, Médecin ou Assureur)")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        User user = authService.registerUser(registerRequest);
        return ResponseEntity.ok("Utilisateur inscrit avec succès avec l'email : " + user.getEmail());
    }
}
