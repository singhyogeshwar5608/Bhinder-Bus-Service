export interface GeneratedSeat {
  id?: number;
  seat_number: string;
  seat_type?: string;
  status: string; // available, selected, locked, booked
}

export interface SeatRow {
  rowLabel: string;
  isLastRow: boolean;
  leftSeats: GeneratedSeat[];
  rightSeats: GeneratedSeat[];
  lastRowSeats?: GeneratedSeat[];
}

export class SeatLayoutGeneratorService {
  /**
   * Helper to check if a seat number corresponds to a ladies seat
   */
  static isLadiesSeat(seatNumber: string): boolean {
    return seatNumber === "4" || seatNumber === "24";
  }

  /**
   * Parse seat layout parameters and return grouped rows using seat data
   */
  static parseLayout(
    seatsInput: GeneratedSeat[],
    layoutType: string,
    lastRowSeatsCount: number,
    leftSeatsCountCustom?: number,
    rightSeatsCountCustom?: number
  ): SeatRow[] {
    const sortedSeats = [...seatsInput].sort((a, b) => Number(a.seat_number) - Number(b.seat_number));
    const totalSeatsCount = sortedSeats.length;

    // Determine regular row seating counts
    let leftCount = 2;
    let rightCount = 3;

    const typeLower = (layoutType || "").toLowerCase();
    if (typeLower.includes("2+3")) {
      leftCount = 2;
      rightCount = 3;
    } else if (typeLower.includes("2+2")) {
      leftCount = 2;
      rightCount = 2;
    } else if (typeLower.includes("2+1")) {
      leftCount = 2;
      rightCount = 1;
    } else if (typeLower.includes("1+2")) {
      leftCount = 1;
      rightCount = 2;
    } else if (typeLower.includes("custom")) {
      leftCount = Number(leftSeatsCountCustom) || 2;
      rightCount = Number(rightSeatsCountCustom) || 2;
    }

    const seatsPerRow = leftCount + rightCount;
    const busRows: SeatRow[] = [];

    // Calculate regular rows count based on total capacity and last row seats
    const regularSeatsCount = Math.max(0, totalSeatsCount - lastRowSeatsCount);
    const regularRowsCount = Math.ceil(regularSeatsCount / seatsPerRow);

    // Generate regular rows
    for (let i = 0; i < regularRowsCount; i++) {
      const start = i * seatsPerRow;
      const rowSeats = sortedSeats.slice(start, start + seatsPerRow);
      if (rowSeats.length > 0) {
        const leftSeats = rowSeats.slice(0, leftCount);
        const rightSeats = rowSeats.slice(leftCount, leftCount + rightCount);
        busRows.push({
          rowLabel: String(i + 1),
          isLastRow: false,
          leftSeats,
          rightSeats,
        });
      }
    }

    // Generate last row
    const lastRowSeats = sortedSeats.slice(regularRowsCount * seatsPerRow);
    if (lastRowSeats.length > 0) {
      busRows.push({
        rowLabel: "L",
        isLastRow: true,
        leftSeats: [],
        rightSeats: [],
        lastRowSeats,
      });
    }

    return busRows;
  }

  /**
   * Generate mock seats for a given configuration (used in Admin Preview)
   */
  static generateMockSeats(totalSeats: number): GeneratedSeat[] {
    const mockSeats: GeneratedSeat[] = [];
    for (let i = 1; i <= totalSeats; i++) {
      mockSeats.push({
        id: i,
        seat_number: String(i),
        status: "available",
        seat_type: "seater",
      });
    }
    return mockSeats;
  }
}
