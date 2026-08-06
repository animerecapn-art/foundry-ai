import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Verify authentication
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { ideaId, messages } = body;

    if (!ideaId) {
      return NextResponse.json({ error: 'Idea ID is required' }, { status: 400 });
    }

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    // Fetch latest reality check report for the idea
    const { data: latestCheck, error: checkError } = await supabase
      .from('reality_checks')
      .select('*')
      .eq('idea_id', ideaId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let systemContext = `You are the AI Co-founder of a promising startup. You are helpful, strategic, highly analytical, and dedicated to helping the founder succeed. You give honest, constructive feedback and brainstorm practical solutions.`;

    if (latestCheck && latestCheck.insights) {
      const reportPackage = latestCheck.insights;
      const inputs = reportPackage.inputs || {};
      const report = reportPackage.report || {};

      systemContext = `You are the AI Co-founder of "${inputs.title || 'the startup'}".
You are collaborating with the founder. You are friendly, strategic, critical but highly supportive, and focused on execution.

Here is the context of your startup and our latest AI Reality Check report (Score: ${latestCheck.overall_score}/100):
- Startup Name: ${inputs.title}
- Industry: ${inputs.category || 'N/A'}
- One-line Pitch: ${inputs.oneLinePitch || 'N/A'}
- Problem we solve: ${inputs.problem || 'N/A'}
- Our Solution: ${inputs.solution || 'N/A'}
- Target Customers: ${inputs.targetAudience || 'N/A'}
- Business Model: ${inputs.businessModel || 'N/A'}

AI Reality Check Report Highlights:
- Reality Score: ${report.realityScore || latestCheck.overall_score}/100
- Summary: ${report.summary || 'N/A'}
- Our Strengths: ${(report.strengths || []).join(', ')}
- Our Weaknesses: ${(report.weaknesses || []).join(', ')}
- Competitors: ${(report.competitors || []).join(', ')}
- Target Customers Persona: ${(report.targetCustomers || []).join(', ')}
- Monetization Ideas: ${(report.monetization || []).join(', ')}
- MVP Features: ${(report.mvpFeatures || []).join(', ')}
- Marketing Ideas: ${(report.marketingIdeas || []).join(', ')}
- Launch Roadmap: ${(report.launchRoadmap || []).join(', ')}
- Investor Opinion: ${report.investorOpinion || 'N/A'}
- Final Verdict: ${report.finalVerdict || 'N/A'}

Rules for Conversation:
1. Always remember you are the Co-founder. Speak using "we", "our", and "us" (e.g. "We should focus on...", "Our biggest bottleneck is...").
2. Answer questions based on our saved startup profile and report. If the founder asks "How can we improve our startup?" or "What are our risks?", refer to the specific strengths, weaknesses, competitor risks, and monetization strategies outlined above.
3. Be constructive, brainstorm concrete action steps, and keep answers concise and structured. Use lists and bold text where helpful.`;
    }

    // Call OpenAI to get the conversational response
    const apiMessages = [
      { role: 'system', content: systemContext },
      ...messages.map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      })),
    ];

    let replyText = '';

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: apiMessages as any,
        temperature: 0.7,
        max_tokens: 1000,
      });

      replyText = completion.choices[0]?.message?.content || 'I could not generate a response. Please try again.';
    } catch (openaiError: any) {
      console.warn('OpenAI chat completion failed, falling back to simulated reply:', openaiError.message);
      replyText = `Hi! As your co-founder, I'm here to work through this with you. (Note: OpenAI is currently offline or quota-limited, so this is a simulated co-founder response). 

Based on our report (Reality Score: ${latestCheck?.overall_score || 75}/100), our most critical priorities right now are:
1. **Validating the MVP**: We need to build our core prototype and test it with early adopters.
2. **Refining Distribution**: Our marketing roadmap points to Product Hunt and communities to manage CAC.
3. **Addressing Competitors**: We have some overlap, so positioning our unique value prop is key.

What specific area of our launch roadmap or feature list would you like to brainstorm next?`;
    }

    return NextResponse.json({
      success: true,
      message: {
        role: 'assistant',
        content: replyText,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('AI Co-founder API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Chat failed' },
      { status: 500 }
    );
  }
}
