import * as tf from '@tensorflow/tfjs';

export class FraudDetectionService {
  private model: tf.LayersModel | null = null;

  async initialize() {
    // Create an autoencoder model for anomaly detection
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [10], units: 5, activation: 'relu' }),
        tf.layers.dense({ units: 2, activation: 'relu' }),
        tf.layers.dense({ units: 5, activation: 'relu' }),
        tf.layers.dense({ units: 10, activation: 'sigmoid' })
      ]
    });

    this.model.compile({
      optimizer: 'adam',
      loss: 'meanSquaredError'
    });
  }

  async detectAnomalies(expenses: any[]) {
    if (!this.model) {
      throw new Error("Model not initialized");
    }

    // Convert expenses to tensor
    const features = this.preprocessExpenses(expenses);
    const tensor = tf.tensor2d(features);

    // Get reconstruction error
    const predicted = this.model.predict(tensor) as tf.Tensor;
    const reconstructionError = tf.metrics.meanSquaredError(tensor, predicted);
    
    // Flag expenses with high reconstruction error as potential fraud
    const threshold = 0.1; // Adjust based on your needs
    return Array.from(reconstructionError.dataSync()).map(error => error > threshold);
  }

  private preprocessExpenses(expenses: any[]) {
    // Convert expenses to numerical features
    return expenses.map(expense => [
      expense.amount,
      new Date(expense.date).getTime(),
      // Add more relevant features
    ]);
  }
}