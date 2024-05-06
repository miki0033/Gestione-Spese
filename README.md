# Gestione delle Spese

Questo progetto è un'applicazione per la gestione delle spese, con un backend sviluppato in Python Flask e un frontend sviluppato in HTML5 e JavaScript.

## Descrizione del Progetto

L'applicazione consente agli utenti di registrare le loro spese, visualizzare un riepilogo delle spese e monitorare i loro budget. Il backend è sviluppato utilizzando Flask, un framework web leggero per Python, mentre il frontend è sviluppato utilizzando JavaScript.

## Struttura del Progetto

La cartella contiene il codice sorgente del backend sviluppato in Python utilizzando Flask. Le dipendenze sono elencate nel file `requirements.txt`.

## Requisiti

Per eseguire correttamente questo progetto, assicurati di avere installati i seguenti strumenti:

- Python per il backend Python.
- Pip per installare le dipendenze Python

## Utilizzo

**Backend:**

- Creare un virtual environment eseguendo il comando `python -m venv venv`.
- Attivare il virtual environment eseguendo il comando `venv/Scripts/activate`
- Installa le dipendenze eseguendo `pip install -r requirements.txt`.
- Avvia il server Flask eseguendo `flask run`.

**Database:**

- Creare un database MySQL `myfamilybank`
- Eseguire le query dei file \*.sql per creare le tabelle necessarie al database
- Creare un file pw.py con la struttura indicata nel file pw.py.example,
  inserendo nelle costanti la chiave di salatura e le credenziali per accedere al proprio database.

Ora puoi aprire il browser e visitare l'URL specificato per utilizzare l'applicazione di Gestione delle Spese.

## Licenza

Questo progetto è distribuito sotto la licenza MIT. Consulta il file `LICENSE` per ulteriori informazioni.
