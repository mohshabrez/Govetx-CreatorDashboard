// Simple credit model implementation
export class Credit {
  static async find() {
    return [];
  }

  static async create(data: any) {
    return {
      _id: `credit_${Date.now()}`,
      ...data,
      populate: () => this,
    };
  }

  static async countDocuments() {
    return 0;
  }
} 