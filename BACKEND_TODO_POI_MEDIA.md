# Backend TODO: Ajouter photo_url et video_url aux POIs dans theme-display

## Problème actuel

L'endpoint `/concierge-api/theme-display/{themeId}?lang={lang}` retourne bien `photo_url` et `video_url` pour l'**activité** (theme), mais **pas pour les POIs individuels**.

### Structure actuelle de la réponse

```json
{
  "theme_id": "691ae8d15a5d7da8e46f2d3f",
  "title": "Restauration Gastronomique",
  "photo_url": "https://res.cloudinary.com/.../a32tojhzpmdez7ecwgnf.jpg",  // ✅ Existe pour l'activité
  "video_url": "",
  "pois": [
    {
      "poi_id": "restaurant_bar_cafe_9726ec4c-f447-4ec1-bd84-e72a9d0c0240",
      "title": "Restaurant NONI",
      "video_url": "",  // ❌ Chaîne vide
      // ❌ Pas de photo_url du tout
      "actions": {
        "slideshow": {
          "available": true
        }
      }
    }
  ]
}
```

## Solution demandée

Ajouter `photo_url` et `video_url` pour **chaque POI** dans la réponse de `theme-display`.

### Structure attendue

```json
{
  "theme_id": "691ae8d15a5d7da8e46f2d3f",
  "title": "Restauration Gastronomique",
  "photo_url": "https://res.cloudinary.com/.../a32tojhzpmdez7ecwgnf.jpg",
  "video_url": "",
  "pois": [
    {
      "poi_id": "restaurant_bar_cafe_9726ec4c-f447-4ec1-bd84-e72a9d0c0240",
      "title": "Restaurant NONI",
      "photo_url": "https://res.cloudinary.com/.../photo_principale_poi.jpg",  // ✅ À ajouter
      "video_url": "https://res.cloudinary.com/.../video_principale_poi.mp4",  // ✅ À ajouter (ou "" si pas de vidéo)
      "actions": {
        "slideshow": {
          "available": true
        }
      }
    }
  ]
}
```

## Endpoint concerné

- **Endpoint**: `GET /concierge-api/theme-display/{themeId}?lang={lang}`
- **Headers**: `x-api-key: {API_KEY}`, `accept: application/json`

## Notes importantes

1. **Photo principale du POI** : C'est la photo configurée dans l'interface d'administration pour chaque POI (champ "Photo principale (URL)")
2. **Vidéo principale du POI** : C'est la vidéo configurée dans l'interface d'administration pour chaque POI (champ "Vidéo principale (URL)")
3. **Fallback** : Si un POI n'a pas de photo/vidéo configurée, retourner une chaîne vide `""` ou `null` (pas `undefined`)
4. **Compatibilité** : Le frontend gère déjà les chaînes vides, donc `""` est acceptable

## Impact frontend

Une fois cette modification faite, le slider principal des activités pourra afficher :
- La vidéo principale du POI si disponible
- Sinon la photo principale du POI si disponible
- Sinon la photo de l'activité (fallback actuel)

## Exemple de test

```bash
curl "http://localhost:4000/concierge-api/theme-display/691ae8d15a5d7da8e46f2d3f?lang=fr" \
  -H "x-api-key: 28bc2e884a7701f733c351a334a68bf1e8cea914dbf19cbae01a852f6ab130f9" \
  -H "accept: application/json"
```

Vérifier que chaque POI dans `pois[]` a bien `photo_url` et `video_url` remplis.

