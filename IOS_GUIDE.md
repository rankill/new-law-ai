# 📱 Guía Completa: Voice Notes AI en iOS

## 🎯 Opciones de Testing y Deploy

### **Opción 1: Simulador (Desarrollo Local)** ⭐ Más Rápido
### **Opción 2: Dispositivo Físico (Testing Real)**
### **Opción 3: TestFlight (Beta Testing)**
### **Opción 4: App Store (Producción)**

---

## 🚀 Opción 1: Simulador iOS (Recomendado para empezar)

### **Pre-requisitos:**
- ✅ macOS (necesario para iOS development)
- ✅ Xcode instalado (gratis desde App Store)
- ✅ CocoaPods instalado

### **1. Instalar Xcode**
```bash
# Desde App Store o:
xcode-select --install
```

### **2. Instalar CocoaPods**
```bash
sudo gem install cocoapods
```

### **3. Compilar y Correr en Simulador**
```bash
# Instalar dependencias iOS
cd ios
pod install
cd ..

# Opción A: Con Expo
npx expo run:ios

# Opción B: Directamente (abre Xcode)
npm run ios
```

### **4. Seleccionar Simulador**
```bash
# Ver simuladores disponibles
xcrun simctl list devices available

# Correr en simulador específico
npx expo run:ios --simulator="iPhone 15 Pro"
```

### **Limitaciones del Simulador:**
- ⚠️ No tiene micrófono real (no podrás grabar audio)
- ⚠️ Cámara simulada
- ✅ Puedes probar la UI, navegación, chat con IA
- ✅ Puedes probar reproducción de notas existentes

---

## 📲 Opción 2: Dispositivo Físico (iPhone Real)

### **Pre-requisitos:**
- ✅ iPhone con cable USB-C/Lightning
- ✅ Apple ID (gratuito)
- ✅ Xcode instalado

### **Paso 1: Configurar Cuenta de Desarrollador**
```bash
# 1. Abre Xcode
open ios/VoiceNotesAI.xcworkspace

# 2. En Xcode:
#    - Preferences → Accounts → Add Apple ID
#    - Signing & Capabilities → Team: [Tu Apple ID]
```

### **Paso 2: Habilitar Modo Desarrollador en iPhone**
```
iPhone → Settings → Privacy & Security → Developer Mode → ON
```

### **Paso 3: Compilar y Instalar**
```bash
# Conecta tu iPhone por cable
# Xcode detectará el dispositivo automáticamente

# Compilar e instalar
npx expo run:ios --device
```

### **Paso 4: Confiar en Certificado**
```
iPhone → Settings → General → VPN & Device Management
→ Developer App → [Tu Apple ID] → Trust
```

### **Beneficios:**
- ✅ Micrófono real funciona
- ✅ Testing completo de grabación
- ✅ Performance real del dispositivo
- ✅ Notificaciones, permisos, etc.

---

## 🧪 Opción 3: TestFlight (Beta Testing)

Para compartir con testers antes de publicar:

### **Pre-requisitos:**
- 💰 Apple Developer Program ($99/año)
- ✅ App configurada en App Store Connect

### **Paso 1: Registrarse en Apple Developer**
1. Ir a https://developer.apple.com
2. Registrarse ($99 USD/año)
3. Aceptar términos y condiciones

### **Paso 2: Crear App en App Store Connect**
```bash
# 1. Ir a https://appstoreconnect.apple.com
# 2. My Apps → + → New App
#    - Platform: iOS
#    - Name: Voice Notes AI
#    - Bundle ID: com.tudominio.voicenotesai
#    - SKU: voicenotesai
```

### **Paso 3: Configurar app.json**
```json
{
  "expo": {
    "name": "Voice Notes AI",
    "slug": "voice-notes-ai",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.defendo.voicenotesai",
      "buildNumber": "1",
      "supportsTablet": true,
      "infoPlist": {
        "NSMicrophoneUsageDescription": "Para grabar notas de voz",
        "NSSpeechRecognitionUsageDescription": "Para transcribir audio"
      }
    }
  }
}
```

### **Paso 4: Build con EAS (Expo Application Services)**
```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login a Expo
eas login

# Configurar proyecto
eas build:configure

# Build para TestFlight
eas build --platform ios --profile preview

# Submit a TestFlight
eas submit --platform ios
```

### **Paso 5: Invitar Testers**
```
App Store Connect → TestFlight → Internal Testing
→ Add Testers (hasta 100 testers gratis)
```

### **Beneficios:**
- ✅ Compartir con hasta 100 testers
- ✅ Testing real en múltiples dispositivos
- ✅ Feedback y crash reports
- ✅ Actualizaciones automáticas

---

## 🏪 Opción 4: App Store (Producción)

### **Pre-requisitos:**
- 💰 Apple Developer Program ($99/año)
- ✅ App aprobada por Apple Review

### **Paso 1: Build de Producción**
```bash
# Build para App Store
eas build --platform ios --profile production

# Submit a App Store
eas submit --platform ios
```

### **Paso 2: App Store Connect - Metadata**
```
1. Screenshots (obligatorios):
   - iPhone 6.7": 1290x2796
   - iPhone 6.5": 1242x2688
   - iPad Pro 12.9": 2048x2732

2. Descripción (español e inglés)

3. Keywords (máx 100 caracteres)

4. Support URL: https://defendo.legal/support

5. Privacy Policy URL: https://defendo.legal/privacy

6. Categoría: Productivity o Business
```

### **Paso 3: Enviar a Review**
```
App Store Connect → My Apps → Voice Notes AI
→ Prepare for Submission → Submit for Review
```

### **Paso 4: Esperar Aprobación**
- ⏱️ Tiempo típico: 24-48 horas
- 🔍 Apple revisa funcionalidad, privacidad, contenido
- ✅ Una vez aprobado, disponible en App Store

---

## 🛠️ Configuración de Permisos iOS

### **app.json - Permisos necesarios:**
```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSMicrophoneUsageDescription": "Voice Notes AI necesita acceso al micrófono para grabar notas de voz",
        "NSSpeechRecognitionUsageDescription": "Para transcribir tus grabaciones de audio a texto",
        "UIBackgroundModes": ["audio"]
      }
    }
  }
}
```

---

## 🧪 Estrategia Recomendada

### **Para Desarrollo:**
1. ⭐ **Simulador** - UI, navegación, lógica
2. **iPhone físico** - Micrófono, grabación completa

### **Para Testing Beta:**
3. **TestFlight** - Compartir con amigos/equipo

### **Para Producción:**
4. **App Store** - Lanzamiento público

---

## ⚡ Quick Start (Simulador)

```bash
# 1. Instalar Xcode (si no lo tienes)
# Desde App Store

# 2. Instalar pods
cd ios && pod install && cd ..

# 3. Correr en simulador
npx expo run:ios --simulator="iPhone 15 Pro"

# 4. Espera a que compile (primera vez: ~5-10 min)
# 5. ¡Listo! App corriendo en simulador
```

---

## 🐛 Troubleshooting Común

### **Error: "No simulator available"**
```bash
# Instalar simuladores adicionales
# Xcode → Preferences → Platforms → iOS → Get
```

### **Error: "Pod install failed"**
```bash
cd ios
pod deintegrate
pod install
cd ..
```

### **Error: "Code signing required"**
```bash
# En Xcode:
# Signing & Capabilities → Automatically manage signing
# Team: [Selecciona tu Apple ID]
```

### **Error: "Command PhaseScriptExecution failed"**
```bash
# Limpiar build
cd ios
rm -rf build
cd ..
npx expo run:ios --clear
```

---

## 💰 Costos

| Opción | Costo | Cuándo usar |
|--------|-------|-------------|
| **Simulador** | Gratis | Desarrollo diario |
| **iPhone físico** | Gratis | Testing real |
| **TestFlight** | $99/año | Beta testing |
| **App Store** | $99/año | Producción |

**Nota:** Los $99/año son del Apple Developer Program, cubre TestFlight + App Store.

---

## 📊 Comparación: Web vs iOS

| Característica | Web (Cloudflare) | iOS App |
|----------------|------------------|---------|
| **Audio Player** | HTML5 nativo | Custom Expo |
| **Micrófono** | ✅ Funciona | ✅ Funciona |
| **Transcripción** | ✅ Deepgram | ✅ Deepgram |
| **AI Chat** | ✅ Funciona | ✅ Funciona |
| **Offline** | ❌ Requiere web | ✅ Posible |
| **Push Notifications** | ⚠️ Limitadas | ✅ Nativas |
| **App Icon** | ❌ No | ✅ Sí |
| **Home Screen** | ⚠️ PWA | ✅ Sí |
| **Deploy** | Gratis (Cloudflare) | $99/año |

---

## 🎯 Recomendación

### **Empieza con:**
1. **Web deployment** (ya lo tienes) - notas.defendo.legal
2. **Simulador iOS** - Para ver cómo se ve
3. **iPhone físico** - Testing real de grabación

### **Después considera:**
4. **TestFlight** - Si quieres beta testers
5. **App Store** - Si quieres distribución pública

La web está funcionando bien, no hay prisa para App Store. 🚀

---

## 🔗 Recursos Útiles

- **Expo iOS Docs:** https://docs.expo.dev/workflow/ios-simulator/
- **Apple Developer:** https://developer.apple.com
- **EAS Build:** https://docs.expo.dev/build/introduction/
- **TestFlight:** https://developer.apple.com/testflight/

---

**Última actualización:** 2026-02-26
**Tu app ya funciona en web:** notas.defendo.legal ✅
