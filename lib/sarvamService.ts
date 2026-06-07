class SarvamService {
  private keys: string[];
  private currentKeyIndex: number;

  constructor() {
    // Collect keys from environment variables. Filter out empty values.
    const keysCollected = [
      process.env.SARVAM_KEY_1 || "",
      process.env.SARVAM_KEY_2 || "",
      process.env.SARVAM_API_KEY || "" // Fallback key
    ].filter(k => k.trim().length > 0);

    this.keys = keysCollected.length > 0 ? keysCollected : [""];
    this.currentKeyIndex = 0;
  }

  private getActiveKey(): string {
    return this.keys[this.currentKeyIndex];
  }

  private rotateKey() {
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.keys.length;
    console.log(`[SarvamService]: Key rotated to index ${this.currentKeyIndex}`);
  }

  /**
   * Resilient fetch wrapper with automatic key rotation on 429 errors.
   */
  public async safeFetch(url: string, options: RequestInit, retryCount = 0): Promise<Response> {
    const key = this.getActiveKey();
    
    // Add the api-subscription-key header
    const headers = {
      ...(options.headers || {}),
      "api-subscription-key": key
    };

    console.log(`[SarvamService]: Fetching ${url} with key index ${this.currentKeyIndex}`);

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      // Automatic rotation on 429 (Too Many Requests)
      if (response.status === 429 && retryCount === 0 && this.keys.length > 1) {
        console.warn(`[SarvamService]: Rate limited (429). Rotating key and retrying...`);
        this.rotateKey();
        return this.safeFetch(url, options, 1); // Retry exactly once
      }

      return response;
    } catch (error) {
      // Do NOT rotate keys on standard network errors, timeouts, or latency
      throw error;
    }
  }

  /**
   * Synthesize text to base64 audio (REST endpoint)
   */
  public async synthesize(text: string, speaker = "shubh"): Promise<string> {
    const response = await this.safeFetch("https://api.sarvam.ai/text-to-speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text,
        model: "bulbul:v3",
        target_language_code: "hi-IN",
        speaker,
        speech_sample_rate: 24000,
        output_audio_codec: "wav"
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Sarvam TTS failed: ${errText}`);
    }

    const data = await response.json();
    if (!data.audios || !data.audios[0]) {
      throw new Error("No audio returned from Sarvam AI");
    }

    return data.audios[0];
  }

  /**
   * Request a binary stream from Sarvam's stream endpoint
   */
  public async streamTTS(text: string, speaker = "shubh"): Promise<Response> {
    const response = await this.safeFetch("https://api.sarvam.ai/text-to-speech/stream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text,
        model: "bulbul:v3",
        target_language_code: "hi-IN",
        speaker,
        speech_sample_rate: 24000,
        output_audio_codec: "wav"
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Sarvam Stream TTS failed: ${errText}`);
    }

    return response;
  }
}

// Export a singleton instance
export const sarvamService = new SarvamService();

// Standalone wrapper for backward-compatibility
export async function synthesizeHindiSpeech(text: string, speaker = "shubh"): Promise<string> {
  return sarvamService.synthesize(text, speaker);
}
