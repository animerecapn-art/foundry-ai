import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { IdeaInputs, OpenAIReport } from '@/types';

const REALITY_CHECK_PROMPT = `You are a senior startup advisor with expertise in market analysis, competitive landscapes, and business feasibility.

Analyze the startup idea provided by the user. Be extremely honest, critical, and constructive. Founders need realistic, data-grounded assessments to avoid wasting time and resources.

You MUST return ONLY valid JSON matching this exact structure:
{
  "realityScore": <0-100 integer reflecting overall viability>,
  "summary": "<a high-level executive summary of the startup and its viability>",
  "strengths": [<3-5 key strengths as strings>],
  "weaknesses": [<3-5 key weaknesses as strings>],
  "risks": [<3-5 hidden risks or blindspots as strings>],
  "opportunities": [<3-5 market opportunities or growth channels as strings>],
  "competitors": [<3-5 key competitors or alternative solutions as strings>],
  "targetCustomers": [<2-3 target customer segments or personas as strings>],
  "monetization": [<2-3 viable revenue models or pricing ideas as strings>],
  "mvpFeatures": [<3-5 core features recommended for the Minimum Viable Product as strings>],
  "marketingIdeas": [<3-4 marketing or customer acquisition ideas as strings>],
  "launchRoadmap": [<3-4 chronological roadmap phases or milestones as strings>],
  "investorOpinion": "<a brief simulated paragraph of what a VC or angel investor would say about this idea>",
  "finalVerdict": "<a 2-3 sentence final verdict and recommendation>"
}

Do not return any markdown code blocks or surrounding text. Return only the raw JSON.`;

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
    const {
      ideaId,
      title, // Startup Name
      oneLinePitch,
      problem,
      solution,
      targetAudience,
      businessModel,
      country,
      category, // Industry
      stage,
      additionalNotes,
    } = body;

    if (!title) {
      return NextResponse.json({ error: 'Startup Name is required' }, { status: 400 });
    }

    // Assemble the structured inputs
    const inputs: IdeaInputs = {
      oneLinePitch: oneLinePitch || '',
      problem: problem || '',
      solution: solution || '',
      targetAudience: targetAudience || '',
      businessModel: businessModel || '',
      country: country || '',
      additionalNotes: additionalNotes || '',
    };

    // Determine target version
    let targetVersion = 1;
    let finalIdeaId = ideaId;

    if (ideaId) {
      const { data: existingIdea } = await supabase
        .from('ideas')
        .select('version')
        .eq('id', ideaId)
        .single();
      
      targetVersion = (existingIdea?.version || 1) + 1;
    } else {
      // If no ideaId, create a new idea record first in 'validating' status
      const { data: newIdea, error: createError } = await supabase
        .from('ideas')
        .insert({
          user_id: user.id,
          title: title,
          description: JSON.stringify(inputs),
          category: category || 'Other',
          stage: stage || 'concept',
          status: 'validating',
          version: 1,
        })
        .select()
        .single();

      if (createError) throw createError;
      finalIdeaId = newIdea.id;
      targetVersion = 1;
    }

    let result: OpenAIReport;
    let isSimulated = false;

    try {
      // Call OpenAI
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: REALITY_CHECK_PROMPT },
          {
            role: 'user',
            content: `Startup Name: ${title}
Industry: ${category || 'Other'}
Stage: ${stage || 'concept'}
Country: ${country || 'Global'}
One-line Pitch: ${inputs.oneLinePitch}
Problem: ${inputs.problem}
Solution: ${inputs.solution}
Target Audience: ${inputs.targetAudience}
Business Model: ${inputs.businessModel}
Additional Notes: ${inputs.additionalNotes}`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 2000,
      });

      const rawContent = completion.choices[0]?.message?.content;
      if (!rawContent) throw new Error('No response from OpenAI');
      result = JSON.parse(rawContent) as OpenAIReport;
    } catch (openaiError: any) {
      console.warn('OpenAI call failed, using simulated fallback:', openaiError.message);
      isSimulated = true;

      // Simulated report generation based on inputs
      const hash = title.length + (category?.length || 0) + (solution?.length || 0);
      const scoreBase = 70 + (hash % 18); // 70-88 score

      result = {
        realityScore: scoreBase,
        summary: `A comprehensive evaluation for "${title}" targeting the ${category || 'General'} industry. The model examines the outlined problem ("${inputs.problem.slice(0, 80)}...") and proposed solution to determine market viability.`,
        strengths: [
          `Addresses a high-friction problem in ${category || 'this sector'}.`,
          `Solution leverages low-overhead implementation details.`,
          `Target audience shows a high willingness to adopt workflow efficiency tools.`
        ],
        weaknesses: [
          `Potential friction onboarding users who rely on manual habits.`,
          `Competitive crowding in general software integrations.`,
          `Reliance on high-touch early relationships for initial client retention.`
        ],
        risks: [
          `Customer Acquisition Costs (CAC) might escalate faster than Lifetime Value (LTV) early on.`,
          `Security compliance bottlenecks in Enterprise segments.`,
          `Product feature overlap with large suite providers.`
        ],
        opportunities: [
          `Establish direct referral loops within small builder communities.`,
          `Integrate with popular workflow and messaging platforms (Slack, Notion).`,
          `Offer custom template packs for niche sub-verticals.`
        ],
        competitors: [
          `Legacy spreadsheets and email-based tracking.`,
          `Niche point-solution software platforms.`,
          `Generic AI conversational models providing static checklists.`
        ],
        targetCustomers: [
          `Independent contractors and freelance professionals.`,
          `Operations managers at high-growth teams (10-100 staff).`,
          `Technology decision-makers in underserved regional markets.`
        ],
        monetization: [
          `Standard subscription: $29/user/month billed annually.`,
          `Free tier covering up to 3 active projects, unlocking premium features.`,
          `Corporate packages including single sign-on (SSO) and dedicated support.`
        ],
        mvpFeatures: [
          `Simple submission pipeline and analytics dashboard.`,
          `Basic templated export for project metrics.`,
          `Auto-alert workflow for target dates.`,
          `Integration connectors for Google Workspace.`
        ],
        marketingIdeas: [
          `Launch in private preview on Product Hunt and developer portals.`,
          `Publish comparative case studies demonstrating actual hours saved.`,
          `Co-host webinars with industry experts focusing on operational productivity.`
        ],
        launchRoadmap: [
          `Phase 1: Build the submission portal and verify standard reports (2 weeks).`,
          `Phase 2: Closed alpha test with 30 target users to evaluate UI/UX (3 weeks).`,
          `Phase 3: Public beta with freemium tier and live onboarding (4 weeks).`,
          `Phase 4: Launch premium integrations and corporate billing features (8 weeks).`
        ],
        investorOpinion: `This idea addresses a clear inefficiency. The monetization model is sensible and low-risk, but distribution will be the main challenge. If the team can prove a low payback period on CAC during beta, this represents an attractive early-stage investment.`,
        finalVerdict: `A viable concept with a clear path to testing. We recommend building the core MVP immediately and recruiting 15 target users for a hands-on pilot to gather baseline retention metrics.`
      };
    }

    // Prepare complete insights package to save in Supabase
    // This stores: inputs, report data, version, and meta
    const reportPackage = {
      version: targetVersion,
      date: new Date().toISOString(),
      inputs: {
        title,
        oneLinePitch,
        problem,
        solution,
        targetAudience,
        businessModel,
        country,
        category,
        stage,
        additionalNotes,
      },
      report: result,
    };

    // Save reality check to database
    const { data: savedCheck, error: saveError } = await supabase
      .from('reality_checks')
      .insert({
        idea_id: finalIdeaId,
        user_id: user.id,
        overall_score: result.realityScore,
        market_score: result.realityScore,
        uniqueness_score: result.realityScore,
        feasibility_score: result.realityScore,
        market_size: result.monetization[0] || 'N/A',
        competition: 'medium',
        feasibility: 'medium',
        uniqueness: 'medium',
        insights: reportPackage as any, // Stores the complete report package!
        risks: result.risks,
        opportunities: result.opportunities,
        model_used: isSimulated ? 'gpt-4o (Simulated Fallback)' : 'gpt-4o',
      })
      .select()
      .single();

    if (saveError) {
      console.error('Failed to save reality check:', saveError);
      throw new Error(`Database error saving report: ${saveError.message}`);
    }

    // Update the parent idea record: increment version, update scores, status
    const { error: updateError } = await supabase
      .from('ideas')
      .update({
        title: title,
        description: JSON.stringify(inputs),
        category: category || 'Other',
        stage: stage || 'concept',
        status: 'validated',
        reality_score: result.realityScore,
        market_score: result.realityScore,
        uniqueness_score: result.realityScore,
        feasibility_score: result.realityScore,
        version: targetVersion,
        updated_at: new Date().toISOString(),
      })
      .eq('id', finalIdeaId)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Failed to update idea with check results:', updateError);
    }

    // Log activity
    await supabase.from('activities').insert({
      user_id: user.id,
      idea_id: finalIdeaId,
      idea_title: title,
      type: 'report_generated',
      title: isSimulated ? `v${targetVersion} Report Generated (Simulated)` : `v${targetVersion} Report Generated`,
      description: `AI Reality Check for "${title}" scored ${result.realityScore}/100`,
    });

    return NextResponse.json({
      success: true,
      checkId: savedCheck?.id,
      ideaId: finalIdeaId,
      simulated: isSimulated,
      result,
    });
  } catch (error) {
    console.error('Reality check error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Reality check failed' },
      { status: 500 }
    );
  }
}

