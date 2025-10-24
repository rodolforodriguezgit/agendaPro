const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Simulación de base de datos en memoria
let bookings = [];
let nextId = 1;

// Todas las rutas aquí requieren autenticación
router.use(authenticateToken);

// GET /bookings - Requiere autenticación
router.get('/bookings', (req, res) => {
  res.json({
    message: 'Bookings obtenidos exitosamente',
    bookings: bookings
  });
});

// POST /bookings - Requiere autenticación y valida traslapes
router.post('/bookings', (req, res) => {
  const { title, description, date, time } = req.body;

  // Validar campos requeridos
  if (!title || !date || !time) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Title, date y time son requeridos'
    });
  }

  // Verificar si ya existe un booking en la misma fecha y hora
  const existingBooking = bookings.find(booking => 
    booking.date === date && booking.time === time
  );

  if (existingBooking) {
    return res.status(409).json({
      error: 'Conflict',
      message: 'Ya existe una reserva en esta fecha y hora'
    });
  }

  // Crear nuevo booking
  const newBooking = {
    id: nextId++,
    title,
    description: description || '',
    date,
    time,
    userId: req.user.id,
    createdAt: new Date().toISOString()
  };

  bookings.push(newBooking);

  res.status(201).json({
    message: 'Booking creado exitosamente',
    booking: newBooking
  });
});

// PUT /bookings/:id - Actualizar booking
router.put('/bookings/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, date, time } = req.body;
  
  const bookingIndex = bookings.findIndex(b => b.id === parseInt(id));
  
  if (bookingIndex === -1) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Booking no encontrado'
    });
  }

  // Verificar traslape (excluyendo el booking actual)
  if (date && time) {
    const existingBooking = bookings.find(booking => 
      booking.id !== parseInt(id) &&
      booking.date === date && 
      booking.time === time
    );

    if (existingBooking) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Ya existe otra reserva en esta fecha y hora'
      });
    }
  }

  // Actualizar booking
  bookings[bookingIndex] = {
    ...bookings[bookingIndex],
    title: title || bookings[bookingIndex].title,
    description: description || bookings[bookingIndex].description,
    date: date || bookings[bookingIndex].date,
    time: time || bookings[bookingIndex].time
  };

  res.json({
    message: 'Booking actualizado exitosamente',
    booking: bookings[bookingIndex]
  });
});

// DELETE /bookings/:id - Eliminar booking
router.delete('/bookings/:id', (req, res) => {
  const { id } = req.params;
  
  const bookingIndex = bookings.findIndex(b => b.id === parseInt(id));
  
  if (bookingIndex === -1) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Booking no encontrado'
    });
  }

  const deletedBooking = bookings.splice(bookingIndex, 1)[0];

  res.json({
    message: 'Booking eliminado exitosamente',
    booking: deletedBooking
  });
});

module.exports = router;