# AdarRewards – interaktywne otwieranie fragmentów nagród

Ta miniaplikacja prezentuje koncepcyjny interfejs programu lojalnościowego AdarRewards. Gracz otwiera paczkę z fragmentami nagród, obserwuje animowane ujawnianie kart, a następnie dodaje je do swojej kolekcji nagród.

## Funkcjonalności

- Ciemny, neonowy motyw inspirowany grami premium.
- Animowana skrzynia z efektami świetlnymi i sekwencyjnym odsłanianiem fragmentów.
- Grupowanie kart według nagrody oraz dynamiczne układanie fragmentów w stosy.
- Kolekcja około 50 nagród z paskami postępu i podświetleniem świeżo uzupełnionych pozycji.
- Obsługa linków mailowych z parametrami `email`, `expires` oraz opcjonalnym pakietem `fragments` zakodowanym w base64 (JSON).
- Informacja o wygaśnięciu linku po upływie 3 dni.

## Jak uruchomić

1. Otwórz plik `index.html` w przeglądarce (np. przeciągnij go na okno przeglądarki).
2. Aby zasymulować logowanie linkiem mailowym, dodaj parametry do adresu URL, np.:

   ```
   file:///ścieżka/do/index.html?email=klient%40adar.pl&expires=2024-12-31T23:59:59Z
   ```

3. Aby wczytać własny pakiet fragmentów, przygotuj strukturę JSON:

   ```json
   [
     { "id": "xbox", "name": "Xbox Series X", "count": 3, "required": 22 },
     { "id": "iphone", "name": "iPhone 15 Pro", "count": 4, "required": 28 }
   ]
   ```

   Zamień ją na Base64 (np. przy pomocy narzędzia online) i dodaj jako parametr `fragments`:

   ```
   ?fragments=W3siaWQiOiJ4Ym94IiwgIm5hbWUiOiJY...```
   ```

4. Jeśli parametr `expires` wskazuje przeszłą datę, zamiast interfejsu pojawi się komunikat o wygaśnięciu fragmentów.

## Struktura plików

- `index.html` – struktura interfejsu oraz szablony elementów.
- `styles.css` – warstwa wizualna, animacje i układ.
- `script.js` – logika sekwencji otwierania paczki oraz aktualizowania kolekcji.

## Zastrzeżenia

Projekt wykorzystuje zdjęcia w tle pobrane z serwisu Unsplash na potrzeby demonstracyjne. W produkcji należy zastąpić je materiałami posiadającymi odpowiednie licencje.
