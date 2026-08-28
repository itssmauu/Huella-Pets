export interface ProductoMock {
  nombre: string;
  categoria: string;
  precio: number;
  stock: number;
  min: number;
}

export interface ServicioMock {
  nombre: string;
  tipo: string;
  precio: number;
  duracion: string;
}

export interface MascotaMock {
  nombre: string;
  tipo: string;
}

export interface ClienteMock {
  nombre: string;
  telefono: string;
  mascotas: MascotaMock[];
}

export const ITBMS_RATE = 0.07;

export const PRODUCTOS: ProductoMock[] = [
  { nombre: "Alimento para Cachorro 3kg", categoria: "Alimentos", precio: 18.5, stock: 24, min: 10 },
  { nombre: "Alimento para Gato Adulto 2kg", categoria: "Alimentos", precio: 14.75, stock: 6, min: 10 },
  { nombre: "Ratón de Juguete con Catnip", categoria: "Juguetes", precio: 3.25, stock: 0, min: 5 },
  { nombre: "Correa Retráctil 5m", categoria: "Accesorios", precio: 12.0, stock: 15, min: 5 },
  { nombre: "Shampoo Antipulgas 500ml", categoria: "Higiene", precio: 9.9, stock: 3, min: 8 },
  { nombre: "Cama Ortopédica Mediana", categoria: "Accesorios", precio: 32.0, stock: 9, min: 4 },
  { nombre: "Arena Sanitaria para Gatos 4kg", categoria: "Higiene", precio: 11.2, stock: 20, min: 10 },
  { nombre: "Snacks Dentales para Perro", categoria: "Alimentos", precio: 6.75, stock: 30, min: 12 },
];

export const SERVICIOS: ServicioMock[] = [
  { nombre: "Baño y Corte", tipo: "Estética", precio: 15.0, duracion: "60 min" },
  { nombre: "Consulta Veterinaria General", tipo: "Veterinaria", precio: 25.0, duracion: "30 min" },
  { nombre: "Aplicación de Vacuna", tipo: "Veterinaria", precio: 18.0, duracion: "20 min" },
  { nombre: "Corte de Uñas", tipo: "Estética", precio: 8.0, duracion: "15 min" },
  { nombre: "Desparasitación", tipo: "Veterinaria", precio: 12.0, duracion: "20 min" },
];

export const CLIENTES: ClienteMock[] = [
  { nombre: "Ana Gómez", telefono: "6123-4567", mascotas: [{ nombre: "Rocky", tipo: "Perro" }, { nombre: "Mimi", tipo: "Gato" }] },
  { nombre: "Carlos Pinzón", telefono: "6234-5678", mascotas: [{ nombre: "Toby", tipo: "Perro" }] },
  { nombre: "Yaritza Sánchez", telefono: "6345-6789", mascotas: [{ nombre: "Luna", tipo: "Gato" }, { nombre: "Max", tipo: "Perro" }] },
  { nombre: "Roberto Chen", telefono: "6456-7890", mascotas: [{ nombre: "Coco", tipo: "Ave" }] },
];