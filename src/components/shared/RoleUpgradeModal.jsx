import { motion, AnimatePresence } from 'framer-motion';
// import './RoleUpgradeModal.css';

export default function RoleUpgradeModal({ isOpen, onConfirm, onCancel }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="modal-overlay">
                    {/* Backdrop Blur Layer */}
                    <motion.div
                        className="modal-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onCancel}
                    />

                    {/* Modal Card */}
                    <motion.div
                        className="modal-card"
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    >
                        <div className="modal-icon">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                                <path d="M22 21v-2a4 4 0 0 0-3-3.87M19 8a4 4 0 0 1 0 7.75" />
                            </svg>
                        </div>

                        <h3 className="modal-title">Buka Fitur Seller</h3>
                        <p className="modal-description">
                            Kamu akan mengaktifkan mode <strong>Both (Buyer & Seller)</strong>.
                            Mulai list material sisa proyekmu dan bantu kurangi limbah konstruksi sekarang.
                        </p>

                        <div className="modal-footer">
                            <button onClick={onConfirm} className="btn-modal-confirm">
                                Ya, Aktifkan Sekarang
                            </button>
                            <button onClick={onCancel} className="btn-modal-cancel">
                                Nanti Saja
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}