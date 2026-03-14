import OpenAI from "openai";

const API_KEY = import.meta.env.VITE_GROQ_API_KEY;

    console.log("GROQ API Key loaded:", API_KEY ? "YES - " + API_KEY.substring(0, 10) + "..." : "NO");

if (!API_KEY) {
  console.warn("VITE_GROQ_API_KEY is missing. Please set it in your .env file or Vercel.");
}

const openai = new OpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: API_KEY || "missing_key",
  dangerouslyAllowBrowser: true, 
});

const JSON_SYSTEM_PROMPT = `Actúa como un asistente de productividad avanzado (Un Segundo Cerebro). Recibirás un texto desordenado ('Brain Dump') junto con la lista actual de tareas, recordatorios y memorias que ya existen.

Tu objetivo es procesar el texto y DEVOLVER ÚNICAMENTE UN OBJETO JSON VÁLIDO. No incluyas explicaciones, ni bloques de código markdown (\`\`\`json), ni ningún otro texto fuera del JSON.

### Reglas para lidar con el contexto existente:
- Si el usuario menciona nueva información sobre un elemento QUE YA EXISTE (ej. cambiar fecha, añadir un nombre, marcar como hecha), devuelve ese elemento con su "id" original para actualizarlo.
- Si el usuario pide borrar algo, devuelve el elemento con su "id" y añade "_delete": true.
- Si es totalmente nuevo, no le pongas la propiedad "id".

### Estructura obligatoria del JSON:
{
  "tasks": [
    { "id": "uuid-existente (opcional)", "title": "Nombre de tarea", "category": "Casa|Trabajo|Urgente|General", "_delete": false }
  ],
  "reminders": [
    { "id": "uuid-existente (opcional)", "title": "Reunión con cliente", "date": "2024-03-12T15:00:00Z" }
  ],
  "memories": [
    { "id": "uuid-existente (opcional)", "text": "A mi primo le gusta el color azul" }
  ],
  "locations": [
    { "name": "Madrid" }
  ],
  "suggestions": [
    "Sugerencia breve 1", 
    "Sugerencia breve 2"
  ]
}

### Reglas Adicionales:
1. Adapta u optimiza los títulos si el usuario da correcciones (ej. "el primo es daniel" modifica una memoria, tarea o recordatorio existente relacionado).
2. EXTRAE MEMORIAS ('memories'): Datos útiles, preferencias, ideas abstractas o información a largo plazo que no requiere acción ("El código de la puerta es 1234", "Quiero aprender a tocar guitarra").
3. Para LOCALIZACIONES ('locations'): SOLO devuelve el nombre del lugar. NO inventes coordenadas. Las coordenadas se obtendrán automáticamente después usando geocodificación. Examples: "Madrid", "Barcelona", "París", "Casa de María", "Oficina Madrid"
4. Las fechas de reminders DEBEN ser ISO 8601. PRESTA ESPECIAL ATENCIÓN AL AÑO ACTUAL en el 'CONTEXTO DEL SISTEMA ACTUAL'. Si el usuario dice "marzo" y estamos en 2026, debes usar 2026.
5. 'suggestions' se reescribe totalmente en cada interacción basándose en el estado global.`;

async function geocodeLocation(locationName) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}&limit=1&addressdetails=0`,
      {
        headers: {
          'User-Agent': 'BrainDumpApp/1.0'
        }
      }
    );
    
    if (!response.ok) throw new Error('Geocoding failed');
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        name: locationName,
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        displayName: data[0].display_name
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

export async function processBrainDumpAsJSON(text, existingContext = {}) {
  if (!API_KEY || API_KEY === "missing_key") {
    console.error("API Key missing or invalid:", API_KEY);
    throw new Error("API Key no configurada. Añade VITE_GROQ_API_KEY en Vercel.");
  }

  const { tasks = [], reminders = [], memories = [] } = existingContext;
  
  const contextString = JSON.stringify({
      fecha_actual_del_sistema: new Date().toISOString(),
      existing_tasks: tasks.map(t => ({ id: t.id, title: t.title, category: t.category, isCompleted: t.isCompleted })),
      existing_reminders: reminders.map(r => ({ id: r.id, title: r.title, date: r.date })),
      existing_memories: memories.map(m => ({ id: m.id, text: m.text }))
  });

  const finalPrompt = `CONTEXTO DEL SISTEMA ACTUAL:\n${contextString}\n\nNUEVO MENSAJE DEL USUARIO:\n${text}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: JSON_SYSTEM_PROMPT },
        { role: "user", content: finalPrompt }
      ]
    });

    const content = completion.choices[0].message.content;
    
    try {
        const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsedData = JSON.parse(cleanContent);
        
        // Geocode locations
        if (parsedData.locations && Array.isArray(parsedData.locations)) {
          const geocodedLocations = [];
          for (const loc of parsedData.locations) {
            if (loc.name) {
              const geocoded = await geocodeLocation(loc.name);
              if (geocoded) {
                geocodedLocations.push(geocoded);
              }
            }
          }
          parsedData.locations = geocodedLocations;
        }
        
        return parsedData;
    } catch (parseError) {
        console.error("Error parsing the LLM response as JSON:", content);
        throw new Error("La IA no devolvió un formato válido estructurado. Inténtalo de nuevo.");
    }

  } catch (error) {
    console.error("Error calling OpenRouter API:", error);
    throw error;
  }
}
