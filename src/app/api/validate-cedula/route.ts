import { NextRequest, NextResponse } from 'next/server';

// Configuración de Airtable
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = 'Clientes Pirolisis'; // Nombre de la tabla donde están las cédulas

export async function POST(request: NextRequest) {
  try {
    const { cedula } = await request.json();

    if (!cedula) {
      return NextResponse.json({ error: 'Cédula es requerida' }, { status: 400 });
    }

    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      return NextResponse.json({ error: 'Error de configuración del servidor' }, { status: 500 });
    }

    // Buscar la cédula en Airtable
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;
    const params = new URLSearchParams({
      filterByFormula: `{Cedula Solicitante} = "${cedula}"`,
      maxRecords: '1'
    });

    const response = await fetch(`${url}?${params}`, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Error al validar la cédula' }, { status: 500 });
    }

    const data = await response.json();
    
    const isValid = data.records && data.records.length > 0;
    
    return NextResponse.json({ 
      isValid,
      cliente: isValid ? data.records[0].fields : null 
    });

  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
