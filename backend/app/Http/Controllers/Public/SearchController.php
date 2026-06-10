<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use App\Models\Seat;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function search(Request $request)
    {
        $request->validate([
            'from_city' => 'required|string',
            'to_city' => 'required|string',
            'journey_date' => 'nullable|date',
        ]);

        $from = $request->from_city;
        $to = $request->to_city;
        $date = $request->journey_date;

        $query = Schedule::with(['bus.driver', 'route.stops', 'driver'])
            ->where('status', 'scheduled')
            ->whereHas('route', function ($query) use ($from, $to) {
                $query->where(function($q) use ($from) {
                    $q->where('from_city', 'LIKE', "%$from%")
                      ->orWhereHas('stops', function($sq) use ($from) {
                          $sq->where('stop_name', 'LIKE', "%$from%");
                      });
                })->where(function($q) use ($to) {
                    $q->where('to_city', 'LIKE', "%$to%")
                      ->orWhereHas('stops', function($sq) use ($to) {
                          $sq->where('stop_name', 'LIKE', "%$to%");
                      });
                });
            });

        if ($date) {
            $query->where('journey_date', $date);
        } else {
            $query->where('journey_date', '>=', now()->toDateString());
        }

        $schedules = $query->orderBy('journey_date')->get();

        $results = $schedules->map(function ($schedule) use ($from, $to) {
            $route = $schedule->route;
            $fromOrder = -1;
            $fromFare = 0;
            $fromTime = $schedule->departure_time;
            $matchedFromCity = "";
            
            $toOrder = -1;
            $toFare = $schedule->fare;
            $toTime = $schedule->arrival_time;
            $matchedToCity = "";

            // Match From City/Stop
            if (stripos($route->from_city, $from) !== false) {
                $fromOrder = 0;
                $fromFare = 0;
                $fromTime = $schedule->departure_time;
                $matchedFromCity = $route->from_city;
            } else {
                $stop = $route->stops->filter(function($s) use ($from) {
                    return stripos($s->stop_name, $from) !== false;
                })->first();
                
                if ($stop) {
                    $fromOrder = $stop->order;
                    $fromFare = $stop->fare;
                    $fromTime = $stop->departure_time ?? $stop->arrival_time;
                    $matchedFromCity = $stop->stop_name;
                }
            }

            // Match To City/Stop
            if (stripos($route->to_city, $to) !== false) {
                $toOrder = 99999;
                $toFare = $schedule->fare;
                $toTime = $schedule->arrival_time;
                $matchedToCity = $route->to_city;
            } else {
                $stop = $route->stops->filter(function($s) use ($to) {
                    return stripos($s->stop_name, $to) !== false;
                })->first();
                
                if ($stop) {
                    $toOrder = $stop->order;
                    $toFare = $stop->fare;
                    $toTime = $stop->arrival_time;
                    $matchedToCity = $stop->stop_name;
                }
            }

            if ($fromOrder !== -1 && $toOrder !== -1 && $fromOrder < $toOrder) {
                $amenities = $schedule->bus->amenities ?? ['A/C', 'Charging Point', 'Water Bottle'];
                if (is_string($amenities)) {
                    $amenities = json_decode($amenities, true);
                }

                $images = $schedule->bus->images ?? [];
                if (is_string($images)) {
                    $images = json_decode($images, true);
                }

                $depTime = \Carbon\Carbon::parse($fromTime)->format('h:i A');
                $arrTime = \Carbon\Carbon::parse($toTime)->format('h:i A');
                
                // Calculate duration
                $start = \Carbon\Carbon::parse($fromTime);
                $end = \Carbon\Carbon::parse($toTime);
                $diff = $start->diff($end);
                $duration = $diff->h . 'h ' . $diff->i . 'm';

                return [
                    'id' => $schedule->id,
                    'name' => $schedule->bus->bus_name,
                    'type' => $schedule->bus->bus_type,
                    'dep' => $depTime,
                    'arr' => $arrTime,
                    'from' => $matchedFromCity,
                    'to' => $matchedToCity,
                    'date' => $schedule->journey_date,
                    'duration' => $duration,
                    'fare' => max(0, $toFare - $fromFare),
                    'available_seats' => $schedule->available_seats,
                    'amenities' => $amenities,
                    'images' => $images,
                    'stops' => $route->stops,
                ];
            }
            return null;
        })->filter()->values();

        return response()->json($results);
    }

    public function getSeats($schedule_id)
    {
        $schedule = Schedule::with('bus.seats')->findOrFail($schedule_id);
        
        $lockedSeats = \App\Models\SeatLock::where('schedule_id', $schedule_id)
            ->where('expires_at', '>', \Carbon\Carbon::now())
            ->pluck('seat_number')
            ->toArray();
        
        $seats = $schedule->bus->seats->map(function ($seat) use ($lockedSeats) {
            $seat->is_locked = in_array($seat->seat_number, $lockedSeats);
            return $seat;
        });
        
        return response()->json([
            'schedule' => $schedule,
            'seats' => $seats
        ]);
    }

    public function getCities()
    {
        $fromCities = \App\Models\Route::where('status', 'active')
            ->distinct()
            ->pluck('from_city')
            ->toArray();
            
        $toCities = \App\Models\Route::where('status', 'active')
            ->distinct()
            ->pluck('to_city')
            ->toArray();

        return response()->json([
            'from_cities' => $fromCities,
            'to_cities' => $toCities,
        ]);
    }

    public function getPopularRoutes()
    {
        $routes = \App\Models\Route::with(['stops'])->withCount(['schedules' => function ($query) {
            $query->where('status', 'scheduled');
        }])
        ->where('status', 'active')
        ->get()
        ->map(function ($route) {
            $minFare = \App\Models\Schedule::where('route_id', $route->id)
                ->where('status', 'scheduled')
                ->min('fare') ?? $route->total_fare;
                
            $img = '/landing/delhi-icon.png';
            $cityLower = strtolower($route->from_city);
            if (str_contains($cityLower, 'delhi')) {
                $img = '/landing/delhi-icon.png';
            } elseif (str_contains($cityLower, 'mumbai')) {
                $img = '/landing/mumbai-icon.png';
            } elseif (str_contains($cityLower, 'bangalore') || str_contains($cityLower, 'hyderabad')) {
                $img = '/landing/hyderabad-icon.png';
            }

            return [
                'id' => $route->id,
                'from' => $route->from_city,
                'to' => $route->to_city,
                'from_city' => $route->from_city,
                'from_city_arrival_time' => $route->from_city_arrival_time,
                'to_city' => $route->to_city,
                'distance' => $route->distance,
                'total_fare' => $route->total_fare,
                'road_type' => $route->road_type,
                'status' => $route->status,
                'stops' => $route->stops,
                'price' => '₹' . number_format($minFare, 0),
                'time' => $route->duration ?? '5h 30m',
                'buses' => $route->schedules_count > 0 ? $route->schedules_count : 24,
                'img' => $img,
            ];
        });

        return response()->json($routes);
    }

    public function getTopBuses()
    {
        $schedules = \App\Models\Schedule::with(['bus', 'route', 'route.stops', 'driver'])
            ->where('status', 'scheduled')
            ->orderBy('journey_date', 'asc')
            ->orderBy('departure_time', 'asc')
            ->get()
            ->map(function ($schedule) {
                $amenities = $schedule->bus->amenities ?? ['A/C', 'Charging Point', 'Water Bottle'];
                if (is_string($amenities)) {
                    $amenities = json_decode($amenities, true);
                }

                // Deterministic color selection for circle badge
                $colors = ["bg-orange-500", "bg-green-600", "bg-blue-700", "bg-purple-600", "bg-teal-600"];
                $color = $colors[$schedule->bus->id % count($colors)] ?? "bg-blue-600";

                $depTime = \Carbon\Carbon::parse($schedule->departure_time)->format('h:i A');
                $arrTime = \Carbon\Carbon::parse($schedule->arrival_time)->format('h:i A');

                $images = $schedule->bus->images ?? [];
                if (is_string($images)) {
                    $images = json_decode($images, true);
                }
                if (empty($images)) {
                    $images = [];
                }

                $driverName = 'Rajesh Kumar';
                if ($schedule->driver) {
                    $driverName = $schedule->driver->driver_name;
                } elseif ($schedule->bus && $schedule->bus->driver) {
                    $driverName = $schedule->bus->driver->driver_name;
                }

                $stopsCount = ($schedule->route && $schedule->route->stops) ? count($schedule->route->stops) : 0;

                return [
                    'id' => $schedule->id,
                    'name' => $schedule->bus->bus_name,
                    'type' => $schedule->bus->bus_type,
                    'dep' => $depTime,
                    'depLoc' => $schedule->route->from_city,
                    'arr' => $arrTime,
                    'arrLoc' => $schedule->route->to_city,
                    'duration' => $schedule->route->duration ?? '5h 30m',
                    'nonStop' => $stopsCount === 0,
                    'stops_count' => $stopsCount,
                    'stops' => ($schedule->route && $schedule->route->stops) ? $schedule->route->stops : [],
                    'driver_name' => $driverName,
                    'price' => '₹' . number_format($schedule->fare, 0),
                    'seats' => $schedule->available_seats,
                    'amenities' => is_array($amenities) ? array_slice($amenities, 0, 4) : ['A/C', 'Charging Point', 'Water Bottle'],
                    'color' => $color,
                    'from' => $schedule->route->from_city,
                    'to' => $schedule->route->to_city,
                    'date' => $schedule->journey_date,
                    'images' => $images,
                    'bus_details' => [
                        'bus_number' => $schedule->bus->bus_number,
                        'bus_name' => $schedule->bus->bus_name,
                        'bus_type' => $schedule->bus->bus_type,
                        'total_seats' => $schedule->bus->total_seats,
                        'bus_category' => $schedule->bus->bus_category ?? 'Standard',
                        'chassis_number' => $schedule->bus->chassis_number,
                        'registration_date' => $schedule->bus->registration_date ? (\Carbon\Carbon::parse($schedule->bus->registration_date)->format('Y-m-d')) : null,
                        'manufacturer' => $schedule->bus->manufacturer,
                        'model' => $schedule->bus->model,
                        'manufacturing_year' => $schedule->bus->manufacturing_year,
                        'fuel_type' => $schedule->bus->fuel_type,
                        'engine_number' => $schedule->bus->engine_number,
                        'emission_norms' => $schedule->bus->emission_norms,
                        'body_type' => $schedule->bus->body_type,
                        'transmission_type' => $schedule->bus->transmission_type ?? 'Manual',
                        'operator' => $schedule->bus->operator ?? 'BusBook Express',
                        'insurance_number' => $schedule->bus->insurance_number,
                        'insurance_valid_till' => $schedule->bus->insurance_valid_till ? (\Carbon\Carbon::parse($schedule->bus->insurance_valid_till)->format('Y-m-d')) : null,
                        'fitness_certificate_number' => $schedule->bus->fitness_certificate_number,
                        'fitness_valid_till' => $schedule->bus->fitness_valid_till ? (\Carbon\Carbon::parse($schedule->bus->fitness_valid_till)->format('Y-m-d')) : null,
                        'puc_number' => $schedule->bus->puc_number,
                        'puc_valid_till' => $schedule->bus->puc_valid_till ? (\Carbon\Carbon::parse($schedule->bus->puc_valid_till)->format('Y-m-d')) : null,
                        'amenities' => is_array($amenities) ? $amenities : ['A/C', 'Charging Point', 'Water Bottle'],
                        'images' => $images,
                    ]
                ];
            });

        return response()->json($schedules);
    }

    public function getPublicBuses()
    {
        $buses = \App\Models\Bus::with(['schedules.route'])->get()
            ->map(function ($bus) {
                $servedFrom = [];
                $servedTo = [];
                foreach ($bus->schedules as $sch) {
                    if ($sch->route) {
                        $servedFrom[] = $sch->route->from_city;
                        $servedTo[] = $sch->route->to_city;
                    }
                }
                $servedFrom = array_values(array_unique($servedFrom));
                $servedTo = array_values(array_unique($servedTo));
                $amenities = $bus->amenities ?? ['A/C', 'Charging Point', 'Water Bottle'];
                if (is_string($amenities)) {
                    $amenities = json_decode($amenities, true);
                }

                // Deterministic color selection for circle badge
                $colors = ["bg-orange-500", "bg-green-600", "bg-blue-700", "bg-purple-600", "bg-teal-600"];
                $color = $colors[$bus->id % count($colors)] ?? "bg-blue-600";

                $images = $bus->images ?? [];
                if (is_string($images)) {
                    $images = json_decode($images, true);
                }
                if (empty($images)) {
                    $images = [];
                }

                return [
                    'id' => $bus->id,
                    'name' => $bus->bus_name,
                    'number' => $bus->bus_number,
                    'type' => $bus->bus_type,
                    'category' => $bus->bus_category ?? 'Standard',
                    'seats' => $bus->total_seats,
                    'operator' => $bus->operator ?? 'BusBook Express',
                    'amenities' => is_array($amenities) ? $amenities : ['A/C', 'Charging Point', 'Water Bottle'],
                    'color' => $color,
                    'manufacturer' => $bus->manufacturer,
                    'model' => $bus->model,
                    'fuel_type' => $bus->fuel_type,
                    'transmission' => $bus->transmission_type ?? 'Manual',
                    'images' => $images,
                    // Additional fields for detailed spec modal matching admin's view modal
                    'bus_name' => $bus->bus_name,
                    'bus_number' => $bus->bus_number,
                    'bus_type' => $bus->bus_type,
                    'total_seats' => $bus->total_seats,
                    'bus_category' => $bus->bus_category ?? 'Standard',
                    'chassis_number' => $bus->chassis_number,
                    'registration_date' => $bus->registration_date ? (\Carbon\Carbon::parse($bus->registration_date)->format('Y-m-d')) : null,
                    'manufacturing_year' => $bus->manufacturing_year,
                    'engine_number' => $bus->engine_number,
                    'emission_norms' => $bus->emission_norms,
                    'body_type' => $bus->body_type,
                    'transmission_type' => $bus->transmission_type ?? 'Manual',
                    'insurance_number' => $bus->insurance_number,
                    'insurance_valid_till' => $bus->insurance_valid_till ? (\Carbon\Carbon::parse($bus->insurance_valid_till)->format('Y-m-d')) : null,
                    'fitness_certificate_number' => $bus->fitness_certificate_number,
                    'fitness_valid_till' => $bus->fitness_valid_till ? (\Carbon\Carbon::parse($bus->fitness_valid_till)->format('Y-m-d')) : null,
                    'puc_number' => $bus->puc_number,
                    'puc_valid_till' => $bus->puc_valid_till ? (\Carbon\Carbon::parse($bus->puc_valid_till)->format('Y-m-d')) : null,
                    'from_cities' => $servedFrom,
                    'to_cities' => $servedTo,
                ];
            });

        return response()->json($buses);
    }

    public function getSchedule($id)
    {
        $schedule = \App\Models\Schedule::with(['bus.driver', 'route', 'route.stops', 'driver'])
            ->findOrFail($id);

        $amenities = $schedule->bus->amenities ?? ['A/C', 'Charging Point', 'Water Bottle'];
        if (is_string($amenities)) {
            $amenities = json_decode($amenities, true);
        }

        $images = $schedule->bus->images ?? [];
        if (is_string($images)) {
            $images = json_decode($images, true);
        }
        if (empty($images)) {
            $images = [];
        }

        $driverName = 'Rajesh Kumar';
        $driverExperience = '8+ Years Experience';
        $driverImage = null;
        if ($schedule->driver) {
            $driverName = $schedule->driver->driver_name;
            $driverExperience = $schedule->driver->experience_years ? ($schedule->driver->experience_years . '+ Years Experience') : '8+ Years Experience';
            $driverImage = $schedule->driver->profile_image;
        } elseif ($schedule->bus && $schedule->bus->driver) {
            $driverName = $schedule->bus->driver->driver_name;
            $driverExperience = $schedule->bus->driver->experience_years ? ($schedule->bus->driver->experience_years . '+ Years Experience') : '8+ Years Experience';
            $driverImage = $schedule->bus->driver->profile_image;
        }

        $stopsCount = ($schedule->route && $schedule->route->stops) ? count($schedule->route->stops) : 0;

        return response()->json([
            'id' => $schedule->id,
            'name' => $schedule->bus->bus_name,
            'type' => $schedule->bus->bus_type,
            'dep' => \Carbon\Carbon::parse($schedule->departure_time)->format('h:i A'),
            'depLoc' => $schedule->route->from_city,
            'arr' => \Carbon\Carbon::parse($schedule->arrival_time)->format('h:i A'),
            'arrLoc' => $schedule->route->to_city,
            'duration' => $schedule->route->duration ?? '5h 30m',
            'nonStop' => $stopsCount === 0,
            'stops_count' => $stopsCount,
            'stops' => ($schedule->route && $schedule->route->stops) ? $schedule->route->stops : [],
            'driver_name' => $driverName,
            'driver_experience' => $driverExperience,
            'driver_rating' => '4.8',
            'driver_image' => $driverImage,
            'price' => '₹' . number_format($schedule->fare, 0),
            'fare' => $schedule->fare,
            'seats' => $schedule->available_seats,
            'amenities' => is_array($amenities) ? $amenities : ['A/C', 'Charging Point', 'Water Bottle'],
            'from' => $schedule->route->from_city,
            'to' => $schedule->route->to_city,
            'date' => $schedule->journey_date,
            'images' => $images,
            'bus_details' => [
                'bus_number' => $schedule->bus->bus_number,
                'bus_name' => $schedule->bus->bus_name,
                'bus_type' => $schedule->bus->bus_type,
                'total_seats' => $schedule->bus->total_seats,
                'bus_category' => $schedule->bus->bus_category ?? 'Standard',
                'chassis_number' => $schedule->bus->chassis_number,
                'registration_date' => $schedule->bus->registration_date ? (\Carbon\Carbon::parse($schedule->bus->registration_date)->format('Y-m-d')) : null,
                'manufacturer' => $schedule->bus->manufacturer,
                'model' => $schedule->bus->model,
                'manufacturing_year' => $schedule->bus->manufacturing_year,
                'fuel_type' => $schedule->bus->fuel_type,
                'engine_number' => $schedule->bus->engine_number,
                'emission_norms' => $schedule->bus->emission_norms,
                'body_type' => $schedule->bus->body_type,
                'transmission_type' => $schedule->bus->transmission_type ?? 'Manual',
                'operator' => $schedule->bus->operator ?? 'BusBook Express',
            ]
        ]);
    }
}