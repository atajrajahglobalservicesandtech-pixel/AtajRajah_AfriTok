import { GoogleGenAI, Type } from "@google/genai";
import { VerificationResult, WithdrawalRiskResult, RiskLevel } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const verifyCreatorWithGemini = async (tiktokHandle: string): Promise<VerificationResult | null> => {
    try {
        const prompt = `You are an AI verification bot for a creator platform called AfriTok. A user with the TikTok handle '${tiktokHandle}' has applied to be a creator. To be eligible, they need at least 1000 followers. First, determine if this is a plausible, real-looking username. Second, simulate a check and state whether they meet the follower count (randomly decide but favor plausibility). Third, generate a unique 6-digit verification code. Fourth, create a user-friendly instruction message for the user to post this code in the comments of their latest TikTok video to confirm ownership. Respond in the specified JSON format.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        plausible_username: { type: Type.BOOLEAN },
                        follower_check_passed: { type: Type.BOOLEAN },
                        follower_count_simulated: { type: Type.INTEGER },
                        verification_code: { type: Type.STRING },
                        user_instructions: { type: Type.STRING },
                    }
                },
            },
        });

        const jsonString = response.text.trim();
        const result: VerificationResult = JSON.parse(jsonString);
        return result;

    } catch (error) {
        console.error("Error verifying creator with Gemini:", error);
        // Fallback in case of API error
        return {
            plausible_username: true,
            follower_check_passed: Math.random() > 0.3, // 70% chance of passing on fallback
            follower_count_simulated: Math.floor(800 + Math.random() * 5000),
            verification_code: Math.floor(100000 + Math.random() * 900000).toString(),
            user_instructions: "API error. Please manually verify. As a fallback, please post this code in your latest TikTok video comment section to verify ownership."
        };
    }
};

export const checkWithdrawalWithGemini = async (amount: number, totalEarnings: number): Promise<WithdrawalRiskResult> => {
    // This is a simulation. A real implementation would involve more complex checks.
    console.log("Simulating AI withdrawal check for:", amount);
    await new Promise(res => setTimeout(res, 1500)); // Simulate network latency

    if (amount > totalEarnings) {
        return {
            riskLevel: RiskLevel.HIGH,
            reason: "Withdrawal amount exceeds total earnings. Potential system glitch or fraud."
        };
    }
    if (amount > 50000) {
        return {
            riskLevel: RiskLevel.MEDIUM,
            reason: "Large withdrawal amount requires manual review for security."
        };
    }
    if (amount < 1000) {
         return {
            riskLevel: RiskLevel.HIGH,
            reason: "Withdrawal amount is below the minimum threshold (Simulated). Please withdraw at least NGN 1,000."
        };
    }

    return {
        riskLevel: RiskLevel.LOW,
        reason: "Withdrawal amount is within normal parameters. Auto-approval is recommended."
    };
};
