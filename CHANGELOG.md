# 📝 Changelog - Voice Notes AI

## [2.0.0] - 2026-02-26

### ✨ Nuevas Funcionalidades

#### 🎤 **Speaker Diarization (Identificación de Hablantes)**
- Detecta automáticamente múltiples personas hablando en las grabaciones
- Cada hablante tiene un color distintivo en la transcripción
- Vista tipo chat mostrando quién dijo qué
- Colores por hablante:
  - **Hablante 1:** Azul (#1e3a8a / #dbeafe)
  - **Hablante 2:** Verde (#065f46 / #d1fae5)
  - **Hablante 3:** Naranja (#7c2d12 / #fed7aa)
  - **Hablante 4:** Morado (#581c87 / #f3e8ff)

#### ⚡ **Loading Animation Mejorado**
- Modal bloqueante durante guardado y transcripción
- Animación de pulso en ícono de cloud-upload
- Previene interacción accidental durante procesamiento
- Mensaje claro del estado actual

#### 🎨 **Rediseño de UI**
- **Tarjetas de notas más modernas:**
  - Bordes redondeados más amplios (16px)
  - Mejor jerarquía visual con tipografía mejorada
  - Sombras más sutiles y profesionales
  - Espaciado optimizado para mejor legibilidad
- **Botón explícito "Abrir":**
  - Ya no se navega al tocar el slider de audio
  - Botón dedicado para abrir la nota completa
  - Mejor UX al interactuar con el reproductor
- **Badges mejorados:**
  - Más grandes y legibles
  - Mejor spacing y esquinas redondeadas

### 🔧 **Mejoras Técnicas**

#### Iconos
- ✅ Reemplazados todos los emojis con `MaterialCommunityIcons`
- ✅ Compatible con web, iOS y Android
- ✅ Íconos consistentes:
  - 🎙 Micrófono para grabar
  - ⏹ Stop para detener
  - 🌐 Traducción para idioma
  - ☁️ Cloud-upload para loading

#### API de Transcripción
```typescript
// Nuevos parámetros Deepgram
diarize: "true"      // Identifica hablantes
utterances: "true"   // Segmenta por utterances
```

#### Interfaces TypeScript
```typescript
export interface TranscriptSegment {
  speaker: number;    // 0, 1, 2, etc.
  text: string;
  start: number;      // segundos
  end: number;        // segundos
}

export interface TranscriptionResult {
  fullTranscript: string;
  segments: TranscriptSegment[];
}
```

### 🐛 **Bugs Corregidos**

1. **Slider activaba navegación**
   - ❌ Antes: Tocar el slider abría la nota
   - ✅ Ahora: Slider es independiente, botón "Abrir" explícito

2. **Sombras excesivas en FAB**
   - ❌ Antes: Sombra blanca muy visible
   - ✅ Ahora: Sombra sutil (opacity 0.08)

3. **Iconos no se veían en web**
   - ❌ Antes: Emojis inconsistentes entre plataformas
   - ✅ Ahora: MaterialCommunityIcons funcionan en todas partes

### 🎯 **Cambios de Texto**

| Antes | Ahora |
|-------|-------|
| "Notas de Voz" | "Mis Notas" |
| ES / EN | 🇪🇸 / 🇺🇸 |
| (Sin botón) | "Abrir" button |

### 📊 **Métricas de Rendimiento**

- **Transcripción:** ~30 seg para 5 min de audio
- **Precisión:** 85-95% (según calidad)
- **Speaker Detection:** Hasta 8 hablantes
- **Storage:** ~1.5 MB/hora de audio

### ⚠️ **Warnings Conocidos (Web)**

Estos warnings son esperados al usar React Native Web:
```
- "shadow*" style props deprecated → Normal en RN Web
- props.pointerEvents deprecated → Normal en RN Web
- useNativeDriver not supported → Fallback a JS automático
```

**No afectan la funcionalidad** - son avisos de compatibilidad.

---

## [1.0.0] - 2026-02-20

### Funcionalidades Iniciales
- ✅ Grabación de audio
- ✅ Transcripción con Deepgram
- ✅ Chat con IA sobre notas
- ✅ Firebase Auth (email/password)
- ✅ Soporte español/inglés
- ✅ Dark mode automático
- ✅ Responsive web + mobile

---

## 🚀 Cómo Actualizar

```bash
# 1. Pull cambios
git pull origin main

# 2. Instalar dependencias (si hay nuevas)
npm install

# 3. Para desarrollo
npm start

# 4. Para web deployment
npm run build:web
```

---

## 📱 Próximas Funcionalidades (Roadmap)

### v2.1.0 (Próxima)
- [ ] Editar título de nota después de crear
- [ ] Buscar en transcripciones (full-text search)
- [ ] Exportar a PDF/TXT
- [ ] Favicon mejorado

### v2.2.0
- [ ] Compartir notas con otros usuarios
- [ ] Tags/Etiquetas para organizar
- [ ] Modo oscuro/claro manual
- [ ] Notificaciones push

### v3.0.0
- [ ] Grabación desde llamadas (móvil)
- [ ] Integración con calendario
- [ ] Resúmenes automáticos
- [ ] Traducciones automáticas

---

## 🤝 Contribuir

¿Ideas? ¿Bugs? Abre un issue o PR en el repositorio.

---

**Última actualización:** 2026-02-26
**Versión actual:** 2.0.0
**Next deploy:** Automático en Cloudflare Pages
