import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldCheck, CheckCircle2, Clock, X, FileText,
  Smartphone, KeyRound, PenTool, Type, Copy, Check,
  Download, Printer, AlertTriangle, Sparkles, Building, MapPin
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { api } from '../../api/endpoints';

export interface SignerItem {
  role: string;
  title?: string;
  name: string;
  phone?: string;
  nida?: string;
  status: 'pending' | 'signed';
  signature_data?: string | null;
  signature_type?: string | null;
  signed_at?: string | null;
  ip_address?: string | null;
  otp_verified?: boolean;
}

export interface ContractData {
  id: string;
  deal: string;
  title: string;
  contract_type: string;
  contract_type_label?: string;
  contract_html_content: string;
  sha256_hash?: string;
  qr_verification_token?: string;
  status: 'draft' | 'pending_signatures' | 'partially_signed' | 'fully_executed' | 'voided';
  status_label?: string;
  signers_manifest: SignerItem[];
  requires_spousal_consent?: boolean;
  executed_at?: string | null;
  created_at: string;
}

interface ContractSigningDeskProps {
  dealId: string;
  contract?: ContractData | null;
  onClose: () => void;
  onContractUpdated?: (contract: ContractData) => void;
  initialRole?: 'seller' | 'buyer' | 'agent' | 'spouse' | 'admin' | 'notary';
}

export const ContractSigningDesk: React.FC<ContractSigningDeskProps> = ({
  dealId,
  contract: initialContract,
  onClose,
  onContractUpdated,
  initialRole = 'seller',
}) => {
  const [contract, setContract] = useState<ContractData | null>(initialContract || null);
  const [loading, setLoading] = useState(!initialContract);
  const [activeSignerRole, setActiveSignerRole] = useState<string>(initialRole);
  const [signMode, setSignMode] = useState<'draw' | 'type'>('draw');
  const [typedName, setTypedName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [otpSentMessage, setOtpSentMessage] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  // Canvas drawing ref and state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef(false);
  const hasDrawn = useRef(false);

  // Load or generate contract if none exists
  useEffect(() => {
    const initContract = async () => {
      if (initialContract) {
        setContract(initialContract);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await api.contracts.generate(dealId);
        setContract(res.data);
        if (onContractUpdated) onContractUpdated(res.data);
      } catch (err: any) {
        console.error('Failed to initialize contract:', err);
        setError(err.response?.data?.error || 'Failed to load or generate contract.');
      } finally {
        setLoading(false);
      }
    };
    initContract();
  }, [dealId, initialContract]);

  // Set default typed name from active signer
  useEffect(() => {
    if (contract) {
      const signer = contract.signers_manifest.find(s => s.role === activeSignerRole);
      if (signer) {
        setTypedName(signer.name || '');
      }
    }
  }, [contract, activeSignerRole]);

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    isDrawing.current = true;
    hasDrawn.current = true;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#10b981'; // Emerald stroke
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasDrawn.current = false;
  };

  // Dispatch OTP
  const handleSendOtp = async () => {
    if (!contract) return;
    setOtpSending(true);
    setError(null);
    try {
      const res = await api.contracts.sendOtp(contract.id, activeSignerRole);
      setOtpSentMessage(res.data.message || 'OTP dispatched to registered phone.');
      if (res.data.debug_otp) {
        setOtpCode(res.data.debug_otp); // Auto-fill in development for fast testing
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send OTP code.');
    } finally {
      setOtpSending(false);
    }
  };

  // Sign and Seal
  const handleSign = async () => {
    if (!contract) return;
    setError(null);

    let signatureData = '';
    if (signMode === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas || !hasDrawn.current) {
        setError('Please draw your signature on the pad before confirming.');
        return;
      }
      signatureData = canvas.toDataURL('image/png');
    } else {
      if (!typedName.trim()) {
        setError('Please enter your full legal name.');
        return;
      }
      // Create SVG representation of typed signature
      signatureData = `data:text/plain;charset=utf-8,${encodeURIComponent(typedName.trim())}`;
    }

    if (!otpCode.trim()) {
      setError('Please request and enter your 6-digit SMS/Email verification OTP.');
      return;
    }

    setSigning(true);
    try {
      const res = await api.contracts.sign(contract.id, {
        role: activeSignerRole,
        signature_data: signatureData,
        signature_type: signMode,
        otp_code: otpCode.trim(),
      });
      setContract(res.data);
      if (onContractUpdated) onContractUpdated(res.data);
      clearCanvas();
      setOtpCode('');
      setOtpSentMessage(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Verification or signing failed.');
    } finally {
      setSigning(false);
    }
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const printDocument = () => {
    window.print();
  };

  const activeSigner = contract?.signers_manifest.find(s => s.role === activeSignerRole);
  const isAlreadySigned = activeSigner?.status === 'signed';
  const isFullyExecuted = contract?.status === 'fully_executed';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn overflow-hidden">
      <div
        className="w-full max-w-5xl h-[92vh] flex flex-col rounded-3xl border border-zinc-200 dark:border-white/10 shadow-2xl overflow-hidden"
        style={{ background: 'var(--color-bg-deep)', color: 'var(--color-text-main)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-200 dark:border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold truncate max-w-md sm:max-w-xl">
                  {contract?.title || 'Bilateral Conveyance Agreement'}
                </h2>
                <Badge
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    isFullyExecuted
                      ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30'
                      : contract?.status === 'partially_signed'
                      ? 'bg-sky-500/20 text-sky-400 border-sky-500/30'
                      : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  }`}
                >
                  {isFullyExecuted ? 'Fully Executed & Sealed' : contract?.status?.replace(/_/g, ' ') || 'Draft'}
                </Badge>
              </div>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                REF #{contract?.id?.slice(0, 8).toUpperCase() || dealId.slice(0, 8).toUpperCase()} • Rwanda Law N° 27/2021 & N° 001/2020 Compliant
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={printDocument}
              className="hidden sm:flex rounded-xl border-zinc-200 dark:border-white/10 text-xs"
              title="Print official copy"
            >
              <Printer size={14} className="mr-1.5" /> Print
            </Button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body: Split View (Document on Left, Signer Desk on Right) */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left Column: Contract Document Viewer */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 border-b lg:border-b-0 lg:border-r border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-black/20">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 text-zinc-400">
                <Clock className="animate-spin text-emerald-500 mb-2" size={28} />
                <span className="text-xs font-semibold">Generating statutory Rwandan legal agreement...</span>
              </div>
            ) : contract ? (
              <div>
                {/* Embedded HTML rendered contract */}
                <div
                  className="prose dark:prose-invert max-w-none text-xs sm:text-sm"
                  dangerouslySetInnerHTML={{ __html: contract.contract_html_content }}
                />

                {/* Signatures Footer Display in Contract */}
                <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-white/10 space-y-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                    Attestation & Digital Signatures Ledger
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {contract.signers_manifest.map((s) => (
                      <div
                        key={s.role}
                        className={`p-3.5 rounded-2xl border text-xs transition-all ${
                          s.status === 'signed'
                            ? 'bg-emerald-500/5 border-emerald-500/30'
                            : 'bg-zinc-100 dark:bg-white/[0.02] border-zinc-200 dark:border-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-zinc-900 dark:text-white">{s.title || s.role.toUpperCase()}</span>
                          {s.status === 'signed' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500">
                              <CheckCircle2 size={12} /> Signed & Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500">
                              <Clock size={12} /> Pending Signature
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-500">{s.name}</p>

                        {s.status === 'signed' && (
                          <div className="mt-2 pt-2 border-t border-emerald-500/20 space-y-1 text-[10px] text-zinc-400">
                            {s.signature_type === 'draw' && s.signature_data && (
                              <div className="h-10 bg-white/5 rounded-lg p-1 flex items-center justify-center">
                                <img src={s.signature_data} alt="Signature" className="h-full object-contain" />
                              </div>
                            )}
                            {s.signature_type === 'type' && (
                              <div className="font-serif italic text-sm text-emerald-400 py-1">
                                {decodeURIComponent(s.signature_data?.replace('data:text/plain;charset=utf-8,', '') || s.name)}
                              </div>
                            )}
                            <div className="font-mono text-[9px] text-zinc-500">
                              Signed: {new Date(s.signed_at || '').toLocaleString()} • IP: {s.ip_address || '127.0.0.1'}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cryptographic Proof Certificate if Fully Executed */}
                {isFullyExecuted && (
                  <div className="mt-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs uppercase tracking-wider">
                      <Sparkles size={14} /> Cryptographic Proof & Evidentiary Timestamp
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono">
                      <div className="truncate max-w-full">
                        <span className="text-zinc-400 block text-[10px]">SHA-256 Fingerprint:</span>
                        <code className="text-emerald-400 text-[11px]">{contract.sha256_hash}</code>
                      </div>
                      <button
                        onClick={() => copyHash(contract.sha256_hash || '')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-[11px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        {copiedHash ? <Check size={12} /> : <Copy size={12} />}
                        {copiedHash ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <div className="text-[10px] text-zinc-400 pt-1">
                      Token: <strong>{contract.qr_verification_token}</strong> • Executed: {new Date(contract.executed_at || '').toUTCString()}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Right Column: Multi-Party Signing Control Desk */}
          <div className="w-full lg:w-[420px] shrink-0 p-6 flex flex-col justify-between overflow-y-auto space-y-6">
            <div className="space-y-5">
              {/* Stepper / Role Selector */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-2">
                  1. Select Signing Authority Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {contract?.signers_manifest.map((s) => (
                    <button
                      key={s.role}
                      onClick={() => setActiveSignerRole(s.role)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        activeSignerRole === s.role
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500 shadow-sm'
                          : 'border-zinc-200 dark:border-white/10 text-zinc-400 hover:border-zinc-300 dark:hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold capitalize">{s.role}</span>
                        {s.status === 'signed' ? (
                          <CheckCircle2 size={13} className="text-emerald-500" />
                        ) : (
                          <Clock size={13} className="text-zinc-500" />
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-400 truncate block mt-0.5">{s.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Banner for Selected Role */}
              {isAlreadySigned ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 size={16} /> Signed as {activeSigner?.title || activeSignerRole}
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Your digital signature has been recorded with phone OTP authentication and legal timestamp.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Signature Mode Selector */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-2">
                      2. Choose Signature Format
                    </label>
                    <div className="flex rounded-xl border border-zinc-200 dark:border-white/10 p-1 bg-zinc-100 dark:bg-white/[0.02]">
                      <button
                        onClick={() => setSignMode('draw')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          signMode === 'draw'
                            ? 'bg-emerald-500 text-white shadow-sm'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        <PenTool size={13} /> Draw Canvas
                      </button>
                      <button
                        onClick={() => setSignMode('type')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          signMode === 'type'
                            ? 'bg-emerald-500 text-white shadow-sm'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        <Type size={13} /> Type Full Name
                      </button>
                    </div>
                  </div>

                  {/* Draw Canvas Pad */}
                  {signMode === 'draw' && (
                    <div className="space-y-2">
                      <div className="relative rounded-2xl border border-zinc-300 dark:border-white/20 bg-white dark:bg-black/40 overflow-hidden shadow-inner">
                        <canvas
                          ref={canvasRef}
                          width={370}
                          height={140}
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          onTouchStart={startDrawing}
                          onTouchMove={draw}
                          onTouchEnd={stopDrawing}
                          className="w-full h-[140px] cursor-crosshair touch-none"
                        />
                        <div className="absolute bottom-2 left-3 text-[10px] text-zinc-400 pointer-events-none select-none">
                          Sign along this line • Kigali Notarial Cadastre
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={clearCanvas}
                          className="text-[11px] text-zinc-400 hover:text-rose-400 font-semibold transition-colors cursor-pointer"
                        >
                          Clear Pad
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Type Signature Input */}
                  {signMode === 'type' && (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={typedName}
                        onChange={(e) => setTypedName(e.target.value)}
                        placeholder="Enter full legal name"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-white/10 bg-transparent text-sm focus:border-emerald-500 outline-none"
                      />
                      {typedName && (
                        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 text-center">
                          <span className="text-[10px] text-zinc-400 block mb-1">Generated Digital Seal:</span>
                          <span className="font-serif italic text-xl text-emerald-500">{typedName}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Rwandan Phone OTP 2FA Step */}
                  <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-white/10">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block">
                      3. Identity Verification (SMS OTP)
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <KeyRound size={14} className="absolute left-3 top-3 text-zinc-400" />
                        <input
                          type="text"
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          placeholder="6-digit OTP code"
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-300 dark:border-white/10 bg-transparent text-xs font-mono font-bold tracking-widest outline-none focus:border-emerald-500"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={otpSending}
                        onClick={handleSendOtp}
                        className="rounded-xl text-xs font-bold border-zinc-200 dark:border-white/10 shrink-0"
                      >
                        <Smartphone size={13} className="mr-1" />
                        {otpSending ? 'Sending...' : 'Get OTP'}
                      </Button>
                    </div>
                    {otpSentMessage && (
                      <p className="text-[11px] text-emerald-500 font-medium">{otpSentMessage}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Error Alert */}
              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
                  <AlertTriangle size={14} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Execute Button */}
            {!isAlreadySigned && (
              <div className="pt-4 border-t border-zinc-200 dark:border-white/10">
                <Button
                  onClick={handleSign}
                  disabled={signing}
                  className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  <ShieldCheck size={15} className="mr-1.5" />
                  {signing ? 'Attesting & Sealing...' : `Affirm & Sign as ${activeSigner?.title || activeSignerRole}`}
                </Button>
                <p className="text-[10px] text-zinc-400 text-center mt-2">
                  By clicking affirm, you execute this legally binding Rwandan conveyance contract under Law N° 001/2020.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractSigningDesk;
