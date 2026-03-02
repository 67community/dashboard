import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const FILE = path.join(process.cwd(), "team_notes_data.json")

function readNotes() {
  try { if (fs.existsSync(FILE)) return JSON.parse(fs.readFileSync(FILE, "utf-8")) } catch {}
  return []
}
function writeNotes(notes: unknown[]) { fs.writeFileSync(FILE, JSON.stringify(notes, null, 2)) }

export async function GET() {
  return NextResponse.json(readNotes(), { headers: { "Cache-Control": "no-store" } })
}
export async function POST(req: NextRequest) {
  const note = await req.json()
  const notes = readNotes()
  const i = notes.findIndex((n: {id:string}) => n.id === note.id)
  if (i >= 0) notes[i] = note; else notes.unshift(note)
  writeNotes(notes)
  return NextResponse.json({ ok: true })
}
export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  writeNotes(readNotes().filter((n: {id:string}) => n.id !== id))
  return NextResponse.json({ ok: true })
}
