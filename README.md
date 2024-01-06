# Evidencija Projekata

[LIVE PROJECT](https://evidencija-projekata.onrender.com)
[YouTube video funkcionalnosti projekta](https://www.youtube.com/watch?v=r7zLRfbbAx4)

Evidencija projekata je aplikacija koja pruža pomoć pri evidenciji projekata na kojima radite, radnicima koji učestvuju na samim projektima te o radnom vremenu i prisustvu korisnika sistema.

Ključne Funkcionalnosti

    Različite Uloge:
        Administrator: Pregled svih aktivnosti sistema u stvarnom vremenu.
        Menadžeri: Kreiranje i upravljanje projektima, timovima i zadacima te praćenje radnog vremena i prisustva.
        Radnici: Izvršavanje dodeljenih zadataka, unos evidencije radnog vremena.

    Upravljanje Projektima:
        Dodavanje i praćenje projekata.
        Formiranje timova sa definisanim vođom i članovima.

    Zadaci i Radnici:
        Dodavanje zadataka na projekte sa asignacijom specifičnom radniku.
        Unos i praćenje izvršenih zadataka.

    Prisustvo i Status:
        Praćenje prisustva odnosno svih online i offline korisnika te vremena kojim su korisnici bili prisutni.
        Praćenje statusa korisnika.

    Realtime Komunikacija:
        Realtime notifikacije.
        Mogućnost korišćenja chata za komunikaciju između korisnika.

    Slanje Obaveštenja:
        Slanje obaveštenja putem e-maila za važne informacije i ažuriranja.
    
    Generisanje izvještaja:
        Generisanje pdf izvještaja sa podacima o radnom vremenu i prisustvo po korisnicima i projektima.
        Mogučnost preuzimanja istih te njihovog slanja na mail.


## Instalacija
1. Instalirajte neophodnih modula: `npm install`

## Konfiguracija

- Prilagodite `.env` fajl tako da on sadrži

1. DBURI=mongoose_uri (ukoliko nije proslijeđen bit će korišten localhost)
2. PORT=broj (ukoliko nije proslijeđen bit će korišten 3000)
3. SESSION_SECRET=secret
4. EMAIL=email
5. EMAIL_PW=email_password

## Pokretanje

1. Pokrenite aplikaciju: `npm start`
2. Aplikacija će biti dostupna na http://localhost:3000/

## Resursi

Za ovu aplikaciju korišteni su slijedeći resursi:

- Ikone

1. https://fontawesome.com/
2. https://www.flaticon.com/

- Background image

3. https://app.haikei.app/
