import React, { useState } from 'react';
import axios from 'axios';
import { Printer, AlertCircle, CheckCircle2 } from 'lucide-react';

const PrintButton = () => {
    const [isPrinting, setIsPrinting] = useState(false);
    const [printStatus, setPrintStatus] = useState(null); // 'success' | 'error' | null
    const [errorMessage, setErrorMessage] = useState("");

    // Exemple d'objet JSON représentant la vente
    const dummyTicket = {
        printerIp: "192.168.1.100", // Remplacer par l'IP de votre imprimante sur le réseau local
        nomCommerce: "FRONT BOUTIK",
        ticketId: `TXN-${Math.floor(Math.random() * 100000)}`,
        items: [
            { name: "Menu Burger Frites", price: 12.50, quantity: 2 },
            { name: "Coca-Cola 33cl", price: 2.50, quantity: 2 },
            { name: "Tiramisu Maison", price: 4.50, quantity: 1 }
        ],
        total: 34.50,
        paiement: "Carte Bancaire"
    };

    const handlePrint = async () => {
        setIsPrinting(true);
        setPrintStatus(null);
        setErrorMessage("");

        try {
            // Le backend Express s'occupe de la communication ESC/POS vers l'imprimante
            const response = await axios.post('http://localhost:3001/api/print', dummyTicket);

            if (response.data.success) {
                setPrintStatus('success');
            }
        } catch (error) {
            setPrintStatus('error');
            // Gestion de l'erreur renvoyée par le backend (imprimante hors ligne, IP fausse, etc.)
            const msg = error.response?.data?.error || "Erreur de connexion au Print Server.";
            setErrorMessage(msg);
        } finally {
            setIsPrinting(false);

            // Réinitialiser le statut après 5 secondes
            setTimeout(() => {
                setPrintStatus(null);
            }, 5000);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-6 space-y-4 rounded-xl border border-gray-100 shadow-sm bg-white max-w-sm mx-auto mt-10">
            <h2 className="text-lg font-semibold text-gray-800">Module d'Impression Thermique</h2>
            <p className="text-sm text-gray-500 text-center mb-4">
                Ce composant envoie un ticket au serveur d'impression Node.js qui relaiera en ESC/POS à l'imprimante locale.
            </p>

            <button
                onClick={handlePrint}
                disabled={isPrinting}
                className={`flex items-center justify-center space-x-2 px-6 py-3 w-full rounded-lg font-medium text-white transition-all
          ${isPrinting
                        ? 'bg-blue-300 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30'
                    }`}
            >
                <Printer size={20} className={isPrinting ? 'animate-pulse' : ''} />
                <span>{isPrinting ? 'Impression en cours...' : 'Imprimer le ticket'}</span>
            </button>

            {/* Affichage du statut */}
            {printStatus === 'success' && (
                <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg w-full">
                    <CheckCircle2 size={18} />
                    <span className="text-sm font-medium">Impression réussie !</span>
                </div>
            )}

            {printStatus === 'error' && (
                <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg w-full">
                    <AlertCircle size={20} className="shrink-0" />
                    <span className="text-sm font-medium">{errorMessage}</span>
                </div>
            )}
        </div>
    );
};

export default PrintButton;
