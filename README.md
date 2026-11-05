# CONAD + UNIEURO · Simulatore di cassa

Simulatore indipendente per esercitazione, con cassa CONAD originale integrata, cassa UNIEURO, cataloghi modificabili e backup cloud Supabase.

## Apri il sito

**https://theyaredeveloper.github.io/conadunieuro/**

## Novità: prodotti in blocco

Dalla schermata iniziale oppure dalla barra della cassa, premi **✍ INSERISCI / MODIFICA MOLTI PRODOTTI**.

Inserisci una riga per articolo, con i campi separati da `;` (o TAB):

```text
NOME;PREZZO;BARCODE;CATEGORIA;IVA;SOTTOCATEGORIA
Latte intero 1L;1,39;;LATTE E DERIVATI;4
Samsung Galaxy A56;349,90;;SMARTPHONE;22;Android
ELIMINA;codice-a-barre-o-nome
```

- Ogni area, **CONAD** e **UNIEURO**, accetta tutte le righe che vuoi incollare.
- Il barcode, la categoria, l'IVA e la sottocategoria sono facoltativi; i nuovi barcode sono generati automaticamente se assenti.
- Gli articoli già presenti vengono aggiornati per barcode o nome esatto, gli altri vengono creati.
- Puoi eliminare un articolo con `ELIMINA;nome-o-barcode`.
- **CONTROLLA RIGHE** verifica la sintassi; **SALVA TUTTE LE MODIFICHE + BACKUP CLOUD** valida entrambi i cataloghi e salva tutte le modifiche insieme. In caso di errori di validazione, nessuna modifica viene applicata.

## Backup cloud

L'app usa il progetto Supabase preconfigurato e mantiene le **ultime 7 copie** per ciascun account autenticato. Il database usa Row Level Security: un utente può leggere e modificare solo i propri backup.

1. Apri **🔐 ADMIN BACKUP** ed esegui l'accesso con la tua email e password Supabase.
2. Quando premi **SALVA TUTTE LE MODIFICHE**, l'app salva in locale e invia immediatamente una copia al cloud.
3. Se non hai ancora effettuato l'accesso o manca la connessione, il salvataggio locale riesce e il backup resta **in attesa**: il pannello lo indica chiaramente e riprova dopo il login.
4. Il backup automatico ogni 24 ore funziona quando la pagina è aperta; non è un servizio pianificato a browser chiuso.
5. Su un nuovo dispositivo, esegui prima **RIPRISTINA** per recuperare i dati cloud ed evitare di sovrascriverli con i cataloghi iniziali.

**Sicurezza:** nessuna password privata o chiave `service_role` è inclusa nel repository. Nel frontend è presente soltanto la chiave Supabase pubblica. Non salvare password nel codice o nei commit.

Il simulatore non è affiliato ai marchi citati; prezzi e pagamenti sono dimostrativi.

## 🎁 Premi fidelity (CONAD e UNIEURO)

Dalla schermata iniziale usa **🎁 PREMI FIDELITY**, oppure entra nel **PANNELLO ADMIN**. Nella cassa UNIEURO il collegamento è anche accanto alle tessere fidelity.

- Scegli CONAD o UNIEURO e seleziona una tessera già creata in quel negozio.
- Catalogo dimostrativo di smartphone Apple iPhone e Samsung Galaxy, con prezzi di riferimento dei siti ufficiali italiani.
- Accumulo fidelity invariato: **1 € di spesa = 1 punto** (impostazione predefinita). Per riscattare un premio il costo è `max(1200, ceil(prezzo_di_riferimento_euro * 50))`: smartphone da circa **40.000 a 75.000 punti**, così un saldo di 20.000 punti non basta per i telefoni più costosi. La regola è esclusivamente della simulazione, non un'offerta dei marchi.
- Il riscatto richiede conferma, scala i punti dalla fidelity e registra lo storico nel backup di quel negozio.
- Dopo il riscatto tenta immediatamente il backup cloud; se non sei autenticato resta in attesa e viene ritentato al login.

Fonti di riferimento: https://www.apple.com/it/shop/buy-iphone e https://www.samsung.com/it/smartphones/galaxy-s26/buy/. I prezzi sono indicativi e possono cambiare. **Nessun premio reale viene distribuito.**

## Schermata iniziale

**⚙ IMPOSTAZIONI SIMULATORE** è il comando principale, grande. **🔐 PANNELLO ADMIN** è più piccolo e riunisce backup cloud, prodotti in blocco, premi fidelity e impostazioni.

**Correzione affidabilità:** il codice dei premi è integrato direttamente in `index.html`, senza dipendenze JavaScript esterne, e i pulsanti di selezione dei modelli funzionano correttamente.

## 💳 Fidelity CONAD — accesso diretto

Nella cassa **CONAD**, sopra il registratore, sono ora disponibili due pulsanti:

- **GESTISCI TESSERE CLIENTI** apre direttamente la gestione fidelity originale CONAD, dove puoi creare una carta con barcode, consultare i punti e usare la carta alla cassa.
- **PREMI FIDELITY** apre il catalogo premi già condiviso, selezionando automaticamente il negozio CONAD. Il riscatto scala i punti e registra lo storico.

L'accumulo punti rimane **1 € di spesa = 1 punto**. I dati CONAD restano separati da quelli UNIEURO e sono inclusi nel sistema di backup cloud del simulatore.
