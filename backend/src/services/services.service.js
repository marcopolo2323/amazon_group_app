const Service = require('../models/Service');
const createError = require('http-errors');

async function createService(input) {
  return Service.create(input);
}

async function listServices() {
  return Service.find().limit(100).sort({ createdAt: -1 });
}

async function updateService(id, update) {
  const allowed = [
    'category','title','description','price','images','locationText','subType','transaction','type','brand','peopleCount','contactEmail','contactPhone','contactWhatsApp','providerName','location','status','features','includesInfo','excludesInfo','cancellationPolicy','availability'
  ];
  const payload = {};
  for (const k of allowed) {
    if (update[k] !== undefined) payload[k] = update[k];
  }
  return Service.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
}

async function deleteService(id, requester) {
  const service = await Service.findById(id);
  if (!service) throw createError(404, 'Servicio no encontrado');
  if (requester) {
    const isOwner = service.affiliateId?.toString() === requester.userId;
    const isAdmin = (requester.role || '').toLowerCase() === 'admin';
    if (!isOwner && !isAdmin) {
      throw createError(403, 'No autorizado para eliminar este servicio');
    }
  }
  await Service.deleteOne({ _id: id });
  return { ok: true };
}

async function findNearbyServices(latitude, longitude, radiusKm, category) {
  console.log('=== FINDING NEARBY SERVICES ===');
  console.log('Params:', { latitude, longitude, radiusKm, category });

  try {
    // Construir el filtro base con consulta geoespacial
    const filter = {
      status: 'active',
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude] // [lng, lat] para GeoJSON
          },
          $maxDistance: radiusKm * 1000 // convertir km a metros
        }
      }
    };

    // Agregar filtro de categoría si se especifica
    if (category && category !== 'all') {
      filter.category = new RegExp(category, 'i');
    }

    console.log('Filter:', JSON.stringify(filter, null, 2));

    // Buscar servicios con geolocalización usando consulta nativa de MongoDB
    const services = await Service.find(filter)
      .populate('affiliateId', 'name avatar rating')
      .lean();

    console.log(`Found ${services.length} services with location data`);

    // Mapear servicios y calcular distancias
    const servicesWithDistance = services.map(service => {
      const [serviceLng, serviceLat] = service.location.coordinates;
      const distance = calculateDistance(latitude, longitude, serviceLat, serviceLng);
      
      return {
        id: service._id.toString(),
        title: service.title,
        description: service.description,
        price: service.price || 0,
        currency: service.currency || 'PEN',
        category: service.category,
        latitude: serviceLat,
        longitude: serviceLng,
        distance: distance,
        affiliate: {
          id: service.affiliateId?._id?.toString() || '',
          name: service.affiliateId?.name || 'Afiliado',
          avatar: service.affiliateId?.avatar || null,
          rating: service.affiliateId?.rating || 4.0
        },
        images: service.images || []
      };
    });

    console.log(`Returning ${servicesWithDistance.length} services within ${radiusKm}km`);
    return servicesWithDistance;

  } catch (error) {
    console.error('Error in findNearbyServices:', error);
    
    // Fallback: usar método manual si la consulta geoespacial falla
    console.log('Falling back to manual distance calculation...');
    return await findNearbyServicesManual(latitude, longitude, radiusKm, category);
  }
}

// Función de fallback que usa cálculo manual de distancias
async function findNearbyServicesManual(latitude, longitude, radiusKm, category) {
  const filter = {
    status: 'active',
    'location.coordinates': { $exists: true, $ne: null }
  };

  if (category && category !== 'all') {
    filter.category = new RegExp(category, 'i');
  }

  const services = await Service.find(filter)
    .populate('affiliateId', 'name avatar rating')
    .lean();

  const servicesWithDistance = services
    .map(service => {
      if (!service.location || !service.location.coordinates || 
          service.location.coordinates.length !== 2) {
        return null;
      }

      const [serviceLng, serviceLat] = service.location.coordinates;
      const distance = calculateDistance(latitude, longitude, serviceLat, serviceLng);
      
      if (distance <= radiusKm) {
        return {
          id: service._id.toString(),
          title: service.title,
          description: service.description,
          price: service.price || 0,
          currency: service.currency || 'PEN',
          category: service.category,
          latitude: serviceLat,
          longitude: serviceLng,
          distance: distance,
          affiliate: {
            id: service.affiliateId?._id?.toString() || '',
            name: service.affiliateId?.name || 'Afiliado',
            avatar: service.affiliateId?.avatar || null,
            rating: service.affiliateId?.rating || 4.0
          },
          images: service.images || []
        };
      }
      return null;
    })
    .filter(service => service !== null)
    .sort((a, b) => a.distance - b.distance);

  return servicesWithDistance;
}

// Función para calcular distancia usando fórmula de Haversine
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

module.exports = { createService, listServices, updateService, deleteService, findNearbyServices };


