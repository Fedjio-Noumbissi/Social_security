package com.csi.securitysociale.dto;

import lombok.Data;

@Data
public class RemboursementProcessRequest {
    private String method; // 'VIREMENT' or 'CASH'
    private String bankAccount; // RIB (optional, required if method is VIREMENT)
}
