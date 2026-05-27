package com.csi.securitysociale.service;

import com.csi.securitysociale.entity.Doctor;
import com.csi.securitysociale.entity.User;
import com.csi.securitysociale.exception.BadRequestException;
import com.csi.securitysociale.exception.ResourceNotFoundException;
import com.csi.securitysociale.repository.DoctorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import com.csi.securitysociale.entity.Consultation;
import com.csi.securitysociale.entity.Patient;
import com.csi.securitysociale.repository.ConsultationRepository;
import com.csi.securitysociale.repository.FeuilleMaladieRepository;
import com.csi.securitysociale.repository.PatientRepository;
import com.csi.securitysociale.repository.RemboursementRepository;

@Service
public class DoctorService {

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private ConsultationRepository consultationRepository;

    @Autowired
    private FeuilleMaladieRepository feuilleMaladieRepository;

    @Autowired
    private RemboursementRepository remboursementRepository;

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    public Doctor getDoctorById(Long id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Médecin non trouvé avec l'id : " + id));
    }

    public Doctor getDoctorByUserId(Long userId) {
        return doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Médecin non trouvé avec le user_id : " + userId));
    }

    public List<Doctor> getDoctorsBySpecialty(String specialty) {
        String spec = specialty.toUpperCase();
        if (!"GENERALISTE".equals(spec) && !"SPECIALISTE".equals(spec)) {
            throw new BadRequestException("La spécialité doit être soit GENERALISTE soit SPECIALISTE !");
        }
        return doctorRepository.findBySpecialty(spec);
    }

    @Transactional
    public Doctor updateDoctor(Long id, Doctor details) {
        Doctor doctor = getDoctorById(id);
        
        if (details.getMatricule() != null && !details.getMatricule().isBlank() 
                && !details.getMatricule().equals(doctor.getMatricule())) {
            if (doctorRepository.existsByMatricule(details.getMatricule())) {
                throw new BadRequestException("Ce matricule est déjà utilisé !");
            }
            doctor.setMatricule(details.getMatricule());
        }

        if (details.getSpecialty() != null && !details.getSpecialty().isBlank()) {
            String spec = details.getSpecialty().toUpperCase();
            if (!"GENERALISTE".equals(spec) && !"SPECIALISTE".equals(spec)) {
                throw new BadRequestException("La spécialité doit être soit GENERALISTE soit SPECIALISTE !");
            }
            doctor.setSpecialty(spec);
        }

        if (details.getUser() != null) {
            User user = doctor.getUser();
            user.setFirstName(details.getUser().getFirstName());
            user.setLastName(details.getUser().getLastName());
            user.setGender(details.getUser().getGender());
        }

        return doctorRepository.save(doctor);
    }

    @Transactional
    public void deleteDoctor(Long id) {
        Doctor doctor = getDoctorById(id);
        
        List<Patient> patients = patientRepository.findByMedecinTraitantId(id);
        for(Patient p : patients) {
            p.setMedecinTraitant(null);
            patientRepository.save(p);
        }

        List<Consultation> consultations = consultationRepository.findByDoctorIdOrderByDateDesc(id);
        for (Consultation c : consultations) {
            feuilleMaladieRepository.findByConsultationId(c.getId()).ifPresent(fm -> {
                remboursementRepository.findByFeuilleMaladieId(fm.getId()).ifPresent(r -> remboursementRepository.delete(r));
                feuilleMaladieRepository.delete(fm);
            });
            consultationRepository.delete(c);
        }

        doctorRepository.delete(doctor);
    }
}
