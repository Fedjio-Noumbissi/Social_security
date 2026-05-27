package com.csi.securitysociale.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank
    @Email
    @Size(max = 100)
    private String email;

    @NotBlank
    @Size(min = 6, max = 50)
    private String password;

    @NotBlank
    @Size(max = 100)
    private String firstName;

    @NotBlank
    @Size(max = 100)
    private String lastName;

    @NotBlank
    @Size(max = 10)
    private String gender; // 'M' or 'F'

    @NotBlank
    private String role; // 'PATIENT', 'MEDECIN', 'ASSUREUR'

    // Patient Specific Fields
    private String socialSecurityNumber;
    private String emergencyContact;
    private Long medecinTraitantId; // Optional

    // Doctor Specific Fields
    private String matricule;
    private String specialty; // 'GENERALISTE' or 'SPECIALISTE'
    private Boolean isInsured = false;
}
