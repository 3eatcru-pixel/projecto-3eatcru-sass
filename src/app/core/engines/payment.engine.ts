import { Injectable } from '@angular/core';
import { SystemExecutionMode } from '../../models/ecosystem.model';

export type PaymentGatewayType = 'pix' | 'credit_card' | 'debit_card' | 'cash' | 'voucher';

export interface PaymentTransactionRequest {
  orderId: string;
  amount: number;
  method: PaymentGatewayType;
  customerName?: string;
  installments?: number;
  tenantId: string;
  isPlatformDelivery?: boolean; // Se true, a plataforma gerencia o pagamento (frete + repasse)
}

export interface PaymentTransactionResult {
  transactionId: string;
  status: 'approved' | 'pending_pix' | 'declined' | 'simulated_success' | 'platform_escrow_hold';
  gateway: string;
  qrCodePix?: string;
  pixCopyPaste?: string;
  authorizationCode: string;
  processedAt: string;
  feeDeducted: number;
  netAmount: number;
  mode: SystemExecutionMode;
  platformEscrowNote?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentEngine {

  /**
   * Processes payments across gateways.
   * REGRA DE NEGÓCIO: Se a entrega for realizada por entregador da plataforma (deliveryFleetType === 'platform'),
   * o pagamento do cliente é processado exclusivamente pelo escrow/gateway central da plataforma.
   */
  processPayment(
    req: PaymentTransactionRequest,
    mode: SystemExecutionMode = 'simulation'
  ): PaymentTransactionResult {
    const authCode = `AUT-${Math.floor(100000 + Math.random() * 900000)}`;
    const txId = `tx-${mode}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    let feeRate = 0.0099;
    if (req.method === 'credit_card') feeRate = 0.0319;
    if (req.method === 'debit_card') feeRate = 0.0149;
    if (req.method === 'cash' || req.method === 'voucher') feeRate = 0;

    const feeDeducted = Number((req.amount * feeRate).toFixed(2));
    const netAmount = Number((req.amount - feeDeducted).toFixed(2));

    let pixCopyPaste = undefined;
    let qrCodePix = undefined;

    if (req.method === 'pix') {
      pixCopyPaste = `00020126580014br.gov.bcb.pix01363eatcru-escrow-${req.orderId}-sp5204000053039865802BR59253EATCRU PLATFORM ESCROW6009SAO PAULO62070503***6304ABCD`;
      qrCodePix = 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=' + encodeURIComponent(pixCopyPaste);
    }

    const platformEscrowNote = req.isPlatformDelivery 
      ? '🔒 [REGRA PLATAFORMA] Pagamento retido em Escrow Centralizado (Entrega por Motoboy da Plataforma 3EAT).' 
      : undefined;

    return {
      transactionId: txId,
      status: req.method === 'pix' ? 'pending_pix' : 'approved',
      gateway: req.method === 'pix' ? 'PIX Instantâneo BCB' : req.method === 'credit_card' ? 'Adquirente Cielo/Stone (Simulado)' : 'Caixa Local / Dinheiro',
      qrCodePix,
      pixCopyPaste,
      authorizationCode: authCode,
      processedAt: new Date().toLocaleTimeString('pt-BR'),
      feeDeducted,
      netAmount,
      mode,
      platformEscrowNote
    };
  }

  /**
   * Simulates instant approval webhook for PIX payments in sandbox mode.
   */
  simulatePixInstantApproval(txResult: PaymentTransactionResult): PaymentTransactionResult {
    return {
      ...txResult,
      status: 'approved',
      authorizationCode: `PIX-OK-${Math.floor(100000 + Math.random() * 900000)}`
    };
  }
}
