package com.csi.securitysociale.service;

import com.csi.securitysociale.dto.JwtAuthenticationResponse;
import com.csi.securitysociale.dto.LoginRequest;
import com.csi.securitysociale.dto.RegisterRequest;
import com.csi.securitysociale.entity.Doctor;
import com.csi.securitysociale.entity.Patient;
import com.csi.securitysociale.entity.User;
import com.csi.securitysociale.exception.BadRequestException;
import com.csi.securitysociale.repository.DoctorRepository;
import com.csi.securitysociale.repository.PatientRepository;
import com.csi.securitysociale.repository.UserRepository;
import com.csi.securitysociale.security.JwtTokenProvider;
import com.csi.securitysociale.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    public JwtAuthenticationResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        List<String> roles = userPrincipal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        return new JwtAuthenticationResponse(
                jwt,
                "Bearer",
                userPrincipal.getId(),
                userPrincipal.getEmail(),
                userPrincipal.getFirstName(),
                userPrincipal.getLastName(),
                roles
        );
    }

    @Transactional
    public User registerUser(RegisterRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new BadRequestException("Cet email est déjà utilisé !");
        }

        // Creating user's account
        User user = User.builder()
                .email(signUpRequest.getEmail())
                .password(passwordEncoder.encode(signUpRequest.getPassword()))
                .firstName(signUpRequest.getFirstName())
                .lastName(signUpRequest.getLastName())
                .gender(signUpRequest.getGender())
                .build();

        Set<String> roles = new HashSet<>();
        String chosenRole = signUpRequest.getRole().toUpperCase();

        if ("ASSUREUR".equals(chosenRole)) {
            roles.add("ROLE_ASSUREUR");
            user.setRoles(roles);
            return userRepository.save(user);
        } else if ("PATIENT".equals(chosenRole)) {
            roles.add("ROLE_PATIENT");
            user.setRoles(roles);

            if (signUpRequest.getSocialSecurityNumber() == null || signUpRequest.getSocialSecurityNumber().isBlank()) {
                throw new BadRequestException("Le numéro de sécurité sociale est obligatoire pour les patients !");
            }
            if (patientRepository.existsBySocialSecurityNumber(signUpRequest.getSocialSecurityNumber())) {
                throw new BadRequestException("Ce numéro de sécurité sociale est déjà enregistré !");
            }

            User savedUser = userRepository.save(user);

            Patient patient = Patient.builder()
                    .user(savedUser)
                    .socialSecurityNumber(signUpRequest.getSocialSecurityNumber())
                    .emergencyContact(signUpRequest.getEmergencyContact())
                    .build();

            if (signUpRequest.getMedecinTraitantId() != null) {
                Doctor gp = doctorRepository.findById(signUpRequest.getMedecinTraitantId())
                        .orElseThrow(() -> new BadRequestException("Médecin traitant non trouvé !"));
                if (!"GENERALISTE".equals(gp.getSpecialty())) {
                    throw new BadRequestException("Le médecin traitant doit obligatoirement être généraliste !");
                }
                patient.setMedecinTraitant(gp);
            }

            patientRepository.save(patient);
            return savedUser;

        } else if ("MEDECIN".equals(chosenRole)) {
            roles.add("ROLE_MEDECIN");

            if (signUpRequest.getMatricule() == null || signUpRequest.getMatricule().isBlank()) {
                throw new BadRequestException("Le matricule est obligatoire pour les médecins !");
            }
            if (doctorRepository.existsByMatricule(signUpRequest.getMatricule())) {
                throw new BadRequestException("Ce matricule de médecin est déjà enregistré !");
            }
            if (signUpRequest.getSpecialty() == null || signUpRequest.getSpecialty().isBlank()) {
                throw new BadRequestException("La spécialité du médecin est obligatoire !");
            }
            String spec = signUpRequest.getSpecialty().toUpperCase();
            if (!"GENERALISTE".equals(spec) && !"SPECIALISTE".equals(spec)) {
                throw new BadRequestException("La spécialité doit être soit GENERALISTE soit SPECIALISTE !");
            }

            // Dual Role setup
            boolean makeInsured = signUpRequest.getIsInsured() != null && signUpRequest.getIsInsured();
            if (makeInsured) {
                roles.add("ROLE_PATIENT");
            }

            user.setRoles(roles);
            User savedUser = userRepository.save(user);

            Doctor doctor = Doctor.builder()
                    .user(savedUser)
                    .matricule(signUpRequest.getMatricule())
                    .specialty(spec)
                    .isInsured(makeInsured)
                    .build();

            doctorRepository.save(doctor);

            if (makeInsured) {
                // Generate a unique social security number based on matricule
                String ssn = "999" + signUpRequest.getMatricule().hashCode();
                if (patientRepository.existsBySocialSecurityNumber(ssn)) {
                    ssn = ssn + "1";
                }
                Patient patient = Patient.builder()
                        .user(savedUser)
                        .socialSecurityNumber(ssn)
                        .emergencyContact("Secrétariat Clinique")
                        .build();
                patientRepository.save(patient);
            }

            return savedUser;
        } else {
            throw new BadRequestException("Rôle inconnu : " + chosenRole);
        }
    }
}
