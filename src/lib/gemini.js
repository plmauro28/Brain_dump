import OpenAI from "openai";

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

if (!API_KEY) {
  console.warn("VITE_OPENROUTER_API_KEY is missing. Please set it in your .env file.");
}

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: API_KEY || "missing_key",
  dangerouslyAllowBrowser: true, 
});

const JSON_SYSTEM_PROMPT = `Actúa como un asistente de productividad avanzado (Un Segundo Cerebro). Recibirás un texto desordenado ('Brain Dump') junto con la lista actual de tareas, recordatorios y memorias que ya existen.

Tu objetivo es procesar el texto y DEVOLVER ÚNICAMENTE UN OBJETO JSON VÁLIDO. No incluyas explicaciones, ni bloques de código markdown (\`\`\`json), ni ningún otro texto fuera del JSON.

### Reglas para lidiar con el contexto existente:
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
    { "name": "Madrid, España", "lat": 40.4168, "lng": -3.7038 }
  ],
  "suggestions": [
    "Sugerencia breve 1", 
    "Sugerencia breve 2"
  ]
}

### Reglas Adicionales:
1. Adapta u optimiza los títulos si el usuario da correcciones (ej. "el primo es daniel" modifica una memoria, tarea o recordatorio existente relacionado).
2. EXTRAE MEMORIAS ('memories'): Datos útiles, preferencias, ideas abstractas o información a largo plazo que no requiere acción ("El código de la puerta es 1234", "Quiero aprender a tocar guitarra").
3. EXTRAE LOCALIZACIONES ('locations'): Nombres de ciudades, países o direcciones que el usuario mencione de paso. Si conoces las lat/lng aproximadas, ponlas; si no, inventa unas coordenadas realistas basadas en el nombre.
4. Las fechas de reminders DEBEN ser ISO 8601. PRESTA ESPECIAL ATENCIÓN AL AÑO ACTUAL en el 'CONTEXTO DEL SISTEMA ACTUAL'. Si el usuario dice "marzo" y estamos en 2026, debes usar 2026.
5. 'suggestions' se reescribe totalmente en cada interacción basándose en el estado global.`;

export async function processBrainDumpAsJSON(text, existingContext = {}) {
  if (!API_KEY) {
    throw new Error("API Key faltante.");
  }

  const { tasks = [], reminders = [], memories = [] } = existingContext;
  
  // Create a minimal contextual representation to save tokens
  const contextString = JSON.stringify({
      fecha_actual_del_sistema: new Date().toISOString(),
      existing_tasks: tasks.map(t => ({ id: t.id, title: t.title, category: t.category, isCompleted: t.isCompleted })),
      existing_reminders: reminders.map(r => ({ id: r.id, title: r.title, date: r.date })),
      existing_memories: memories.map(m => ({ id: m.id, text: m.text }))
  });

  const finalPrompt = `CONTEXTO DEL SISTEMA ACTUAL:\n${contextString}\n\nNUEVO MENSAJE DEL USUARIO:\n${text}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "openrouter/auto",
      messages: [
        { role: "system", content: JSON_SYSTEM_PROMPT },
        { role: "user", content: finalPrompt }
      ]
    });

    const content = completion.choices[0].message.content;
    
    try {
        // En modelos gratuitos, a veces meten markdown de bloques de código a pesar de las instrucciones
        const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(cleanContent);
    } catch (parseError) {
        console.error("Error parsing the LLM response as JSON:", content);
        throw new Error("La IA no devolvió un formato válido estructurado. Inténtalo de nuevo.");
    }

  } catch (error) {
    console.error("Error calling OpenRouter API:", error);
    throw error;
  }
}
