'use client';

import { useState } from 'react';
import { Check, Star, Layout, Eye } from 'lucide-react';
import { TEMPLATE_INFO } from './templates';

/**
 * Template visual layout previews
 */
const TemplateLayoutPreview = ({ templateId }) => {
    switch (templateId) {
        case 'modern':
            return (
                <div className="layout-preview modern">
                    {/* Gradient header */}
                    <div className="mock-header gradient-header">
                        <div className="mock-name"></div>
                        <div className="mock-title"></div>
                        <div className="mock-contact-row"></div>
                    </div>
                    <div className="mock-body">
                        <div className="mock-section">
                            <div className="mock-section-title"></div>
                            <div className="mock-lines">
                                <div className="mock-line w-90"></div>
                                <div className="mock-line w-80"></div>
                            </div>
                        </div>
                        <div className="mock-section">
                            <div className="mock-section-title"></div>
                            <div className="mock-tags">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    </div>
                    <style jsx>{`
                        .modern .gradient-header {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            padding: 12px;
                            border-radius: 0;
                        }
                        .modern .mock-name { width: 60%; height: 10px; background: rgba(255,255,255,0.9); margin-bottom: 4px; }
                        .modern .mock-title { width: 40%; height: 6px; background: rgba(255,255,255,0.6); margin-bottom: 6px; }
                        .modern .mock-contact-row { width: 80%; height: 4px; background: rgba(255,255,255,0.4); }
                        .modern .mock-body { padding: 10px; }
                        .modern .mock-section { margin-bottom: 8px; }
                        .modern .mock-section-title { width: 35%; height: 6px; background: #667eea; margin-bottom: 6px; }
                        .modern .mock-lines { display: flex; flex-direction: column; gap: 3px; }
                        .modern .mock-line { height: 4px; background: #e5e7eb; border-radius: 2px; }
                        .modern .w-90 { width: 90%; }
                        .modern .w-80 { width: 80%; }
                        .modern .mock-tags { display: flex; gap: 4px; }
                        .modern .mock-tags span { width: 20px; height: 8px; background: rgba(102,126,234,0.2); border-radius: 4px; }
                    `}</style>
                </div>
            );

        case 'professional':
            return (
                <div className="layout-preview professional">
                    {/* Two-column layout with sidebar */}
                    <div className="two-col">
                        <div className="sidebar">
                            <div className="avatar"></div>
                            <div className="sidebar-section">
                                <div className="sidebar-lines">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                            <div className="sidebar-section">
                                <div className="sidebar-tags">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        </div>
                        <div className="main-content">
                            <div className="name-block"></div>
                            <div className="title-block"></div>
                            <div className="content-section">
                                <div className="content-line w-full"></div>
                                <div className="content-line w-90"></div>
                            </div>
                            <div className="content-section">
                                <div className="content-line w-70"></div>
                                <div className="content-line w-60"></div>
                            </div>
                        </div>
                    </div>
                    <style jsx>{`
                        .professional .two-col { display: flex; height: 100%; }
                        .professional .sidebar { width: 35%; background: #1e3a5f; padding: 10px; }
                        .professional .avatar { width: 28px; height: 28px; background: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 8px; }
                        .professional .sidebar-section { margin-bottom: 8px; }
                        .professional .sidebar-lines { display: flex; flex-direction: column; gap: 3px; }
                        .professional .sidebar-lines span { height: 4px; background: rgba(255,255,255,0.3); width: 80%; }
                        .professional .sidebar-tags { display: flex; flex-direction: column; gap: 3px; }
                        .professional .sidebar-tags span { height: 6px; background: rgba(255,255,255,0.2); width: 70%; border-radius: 3px; }
                        .professional .main-content { flex: 1; padding: 10px; background: white; }
                        .professional .name-block { width: 70%; height: 10px; background: #1e3a5f; margin-bottom: 4px; }
                        .professional .title-block { width: 50%; height: 6px; background: #e5e7eb; margin-bottom: 8px; }
                        .professional .content-section { margin-bottom: 8px; }
                        .professional .content-line { height: 4px; background: #e5e7eb; margin-bottom: 3px; border-radius: 2px; }
                        .professional .w-full { width: 100%; }
                        .professional .w-90 { width: 90%; }
                        .professional .w-70 { width: 70%; }
                        .professional .w-60 { width: 60%; }
                    `}</style>
                </div>
            );

        case 'creative':
            return (
                <div className="layout-preview creative">
                    <div className="creative-layout">
                        <div className="accent-sidebar">
                            <div className="name-vertical"></div>
                            <div className="contact-dots">
                                <span></span><span></span><span></span>
                            </div>
                            <div className="skill-bars">
                                <div className="skill-bar"><span style={{width:'80%'}}></span></div>
                                <div className="skill-bar"><span style={{width:'65%'}}></span></div>
                                <div className="skill-bar"><span style={{width:'90%'}}></span></div>
                            </div>
                        </div>
                        <div className="creative-main">
                            <div className="timeline-item">
                                <div className="timeline-dot"></div>
                                <div className="timeline-content">
                                    <div className="line w-60"></div>
                                    <div className="line w-80"></div>
                                </div>
                            </div>
                            <div className="timeline-item">
                                <div className="timeline-dot"></div>
                                <div className="timeline-content">
                                    <div className="line w-70"></div>
                                    <div className="line w-50"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <style jsx>{`
                        .creative .creative-layout { display: flex; height: 100%; }
                        .creative .accent-sidebar { width: 30%; background: linear-gradient(180deg, #f97316 0%, #ea580c 100%); padding: 10px; }
                        .creative .name-vertical { width: 70%; height: 8px; background: white; margin-bottom: 6px; }
                        .creative .contact-dots { display: flex; gap: 4px; margin-bottom: 10px; }
                        .creative .contact-dots span { width: 6px; height: 6px; background: rgba(255,255,255,0.5); border-radius: 50%; }
                        .creative .skill-bars { display: flex; flex-direction: column; gap: 4px; }
                        .creative .skill-bar { height: 6px; background: rgba(255,255,255,0.2); border-radius: 3px; }
                        .creative .skill-bar span { display: block; height: 100%; background: white; border-radius: 3px; }
                        .creative .creative-main { flex: 1; padding: 10px; background: white; }
                        .creative .timeline-item { display: flex; gap: 8px; margin-bottom: 10px; }
                        .creative .timeline-dot { width: 8px; height: 8px; background: #f97316; border-radius: 50%; flex-shrink: 0; }
                        .creative .timeline-content { flex: 1; }
                        .creative .line { height: 4px; background: #e5e7eb; margin-bottom: 3px; border-radius: 2px; }
                        .creative .w-60 { width: 60%; }
                        .creative .w-80 { width: 80%; }
                        .creative .w-70 { width: 70%; }
                        .creative .w-50 { width: 50%; }
                    `}</style>
                </div>
            );

        case 'minimalist':
            return (
                <div className="layout-preview minimalist">
                    <div className="minimal-content">
                        <div className="centered-header">
                            <div className="name-line"></div>
                            <div className="contact-line"></div>
                        </div>
                        <div className="divider"></div>
                        <div className="section">
                            <div className="section-title"></div>
                            <div className="paragraph">
                                <div className="text-line w-full"></div>
                                <div className="text-line w-90"></div>
                            </div>
                        </div>
                        <div className="section">
                            <div className="section-title"></div>
                            <div className="paragraph">
                                <div className="text-line w-80"></div>
                                <div className="text-line w-70"></div>
                            </div>
                        </div>
                    </div>
                    <style jsx>{`
                        .minimalist .minimal-content { padding: 12px; background: white; height: 100%; }
                        .minimalist .centered-header { text-align: center; margin-bottom: 8px; }
                        .minimalist .name-line { width: 50%; height: 10px; background: #111827; margin: 0 auto 4px; }
                        .minimalist .contact-line { width: 70%; height: 4px; background: #9ca3af; margin: 0 auto; }
                        .minimalist .divider { height: 1px; background: #111827; margin: 8px 0; }
                        .minimalist .section { margin-bottom: 8px; }
                        .minimalist .section-title { width: 30%; height: 5px; background: #111827; margin-bottom: 6px; }
                        .minimalist .paragraph { display: flex; flex-direction: column; gap: 3px; }
                        .minimalist .text-line { height: 4px; background: #e5e7eb; border-radius: 2px; }
                        .minimalist .w-full { width: 100%; }
                        .minimalist .w-90 { width: 90%; }
                        .minimalist .w-80 { width: 80%; }
                        .minimalist .w-70 { width: 70%; }
                    `}</style>
                </div>
            );

        case 'executive':
            return (
                <div className="layout-preview executive">
                    <div className="exec-header">
                        <div className="exec-name"></div>
                        <div className="exec-contact-grid">
                            <span></span><span></span>
                        </div>
                        <div className="gold-line"></div>
                    </div>
                    <div className="exec-body">
                        <div className="exec-section">
                            <div className="exec-title"></div>
                            <div className="exec-box">
                                <div className="box-line w-90"></div>
                                <div className="box-line w-80"></div>
                            </div>
                        </div>
                        <div className="exec-footer">
                            <div className="footer-col">
                                <div className="fc-title"></div>
                                <div className="fc-line"></div>
                            </div>
                            <div className="footer-col">
                                <div className="fc-title"></div>
                                <div className="competencies">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <style jsx>{`
                        .executive .exec-header { background: #0f172a; padding: 10px; }
                        .executive .exec-name { width: 50%; height: 10px; background: white; margin-bottom: 6px; }
                        .executive .exec-contact-grid { display: flex; gap: 8px; margin-bottom: 8px; }
                        .executive .exec-contact-grid span { width: 30px; height: 8px; background: rgba(255,255,255,0.3); }
                        .executive .gold-line { height: 3px; background: linear-gradient(90deg, #fbbf24, #d97706); }
                        .executive .exec-body { padding: 10px; background: white; }
                        .executive .exec-section { margin-bottom: 8px; }
                        .executive .exec-title { width: 25%; height: 5px; background: #0f172a; margin-bottom: 6px; padding-left: 6px; border-left: 2px solid #0f172a; }
                        .executive .exec-box { background: #f8fafc; padding: 6px; border-radius: 3px; }
                        .executive .box-line { height: 4px; background: #cbd5e1; margin-bottom: 3px; border-radius: 2px; }
                        .executive .w-90 { width: 90%; }
                        .executive .w-80 { width: 80%; }
                        .executive .exec-footer { display: flex; gap: 10px; border-top: 1px solid #e5e7eb; padding-top: 8px; }
                        .executive .footer-col { flex: 1; }
                        .executive .fc-title { width: 40%; height: 4px; background: #0f172a; margin-bottom: 4px; }
                        .executive .fc-line { width: 80%; height: 4px; background: #e5e7eb; }
                        .executive .competencies { display: flex; gap: 3px; }
                        .executive .competencies span { width: 16px; height: 6px; background: #0f172a; border-radius: 1px; }
                    `}</style>
                </div>
            );

        case 'tech':
            return (
                <div className="layout-preview tech">
                    <div className="terminal-bar">
                        <span className="dot red"></span>
                        <span className="dot yellow"></span>
                        <span className="dot green"></span>
                    </div>
                    <div className="terminal-header">
                        <span className="prompt">$</span>
                        <span className="name"></span>
                    </div>
                    <div className="tech-stack-bar">
                        <span></span><span></span><span></span><span></span>
                    </div>
                    <div className="tech-grid">
                        <div className="main-col">
                            <div className="code-block">
                                <div className="code-line w-80"></div>
                                <div className="code-line w-60"></div>
                            </div>
                        </div>
                        <div className="side-col">
                            <div className="side-section">
                                <div className="tech-tags">
                                    <span></span><span></span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <style jsx>{`
                        .tech { background: #0d1117; height: 100%; }
                        .tech .terminal-bar { display: flex; gap: 4px; padding: 6px 8px; background: #21262d; }
                        .tech .dot { width: 8px; height: 8px; border-radius: 50%; }
                        .tech .dot.red { background: #f85149; }
                        .tech .dot.yellow { background: #f0883e; }
                        .tech .dot.green { background: #3fb950; }
                        .tech .terminal-header { padding: 8px; display: flex; align-items: center; gap: 6px; }
                        .tech .prompt { color: #3fb950; font-size: 12px; font-weight: bold; }
                        .tech .name { width: 40%; height: 8px; background: #58a6ff; }
                        .tech .tech-stack-bar { display: flex; gap: 4px; padding: 6px 8px; background: #21262d; }
                        .tech .tech-stack-bar span { width: 20px; height: 8px; background: #238636; border-radius: 10px; }
                        .tech .tech-grid { display: flex; padding: 8px; gap: 8px; }
                        .tech .main-col { flex: 1; }
                        .tech .code-block { background: #161b22; border: 1px solid #30363d; border-radius: 4px; padding: 8px; }
                        .tech .code-line { height: 4px; background: #30363d; margin-bottom: 3px; border-radius: 2px; }
                        .tech .w-80 { width: 80%; }
                        .tech .w-60 { width: 60%; }
                        .tech .side-col { width: 35%; background: #161b22; padding: 6px; border-radius: 4px; }
                        .tech .tech-tags { display: flex; flex-wrap: wrap; gap: 3px; }
                        .tech .tech-tags span { width: 24px; height: 6px; background: #21262d; border: 1px solid #30363d; border-radius: 2px; }
                    `}</style>
                </div>
            );

        case 'awesome':
            return (
                <div className="layout-preview awesome">
                    {/* LaTeX-inspired header */}
                    <div className="awesome-header">
                        <div className="awesome-name"></div>
                        <div className="awesome-title"></div>
                        <div className="awesome-contact-row">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                    <div className="awesome-body">
                        <div className="awesome-section">
                            <div className="awesome-section-title"></div>
                            <div className="awesome-content">
                                <div className="awesome-line w-90"></div>
                                <div className="awesome-line w-85"></div>
                            </div>
                        </div>
                        <div className="awesome-section">
                            <div className="awesome-section-title"></div>
                            <div className="awesome-skills-grid">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    </div>
                    <style jsx>{`
                        .awesome { background: white; height: 100%; }
                        .awesome .awesome-header { padding: 12px; text-align: center; }
                        .awesome .awesome-name { width: 45%; height: 12px; background: #0395DE; margin: 0 auto 6px; }
                        .awesome .awesome-title { width: 35%; height: 6px; background: #333; margin: 0 auto 8px; }
                        .awesome .awesome-contact-row { display: flex; justify-content: center; gap: 12px; }
                        .awesome .awesome-contact-row span { width: 40px; height: 4px; background: #666; }
                        .awesome .awesome-body { padding: 10px 12px; }
                        .awesome .awesome-section { margin-bottom: 10px; }
                        .awesome .awesome-section-title { width: 30%; height: 6px; background: #0395DE; margin-bottom: 6px; border-bottom: 1px solid #0395DE; padding-bottom: 4px; }
                        .awesome .awesome-content { padding-left: 8px; }
                        .awesome .awesome-line { height: 4px; background: #e5e7eb; margin-bottom: 4px; }
                        .awesome .w-90 { width: 90%; }
                        .awesome .w-85 { width: 85%; }
                        .awesome .awesome-skills-grid { display: flex; gap: 6px; }
                        .awesome .awesome-skills-grid span { width: 35px; height: 8px; background: rgba(3,149,222,0.1); border: 1px solid #0395DE; border-radius: 2px; }
                    `}</style>
                </div>
            );

        case 'pikachu':
            return (
                <div className="layout-preview pikachu">
                    {/* Bold header with red accent */}
                    <div className="pikachu-header">
                        <div className="pikachu-photo"></div>
                        <div className="pikachu-name-area">
                            <div className="pikachu-name"></div>
                            <div className="pikachu-title"></div>
                        </div>
                    </div>
                    <div className="pikachu-contact-bar">
                        <span></span><span></span><span></span>
                    </div>
                    <div className="pikachu-two-col">
                        <div className="pikachu-main">
                            <div className="pikachu-section">
                                <div className="pikachu-section-title"></div>
                                <div className="pikachu-line w-90"></div>
                                <div className="pikachu-line w-80"></div>
                            </div>
                        </div>
                        <div className="pikachu-side">
                            <div className="pikachu-side-section">
                                <div className="pikachu-side-title"></div>
                                <div className="pikachu-tags">
                                    <span></span><span></span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <style jsx>{`
                        .pikachu { background: white; height: 100%; }
                        .pikachu .pikachu-header { display: flex; align-items: center; gap: 10px; padding: 10px; background: #dc2626; }
                        .pikachu .pikachu-photo { width: 28px; height: 28px; background: rgba(255,255,255,0.3); border-radius: 50%; }
                        .pikachu .pikachu-name-area { flex: 1; }
                        .pikachu .pikachu-name { width: 60%; height: 10px; background: white; margin-bottom: 4px; }
                        .pikachu .pikachu-title { width: 40%; height: 5px; background: rgba(255,255,255,0.7); }
                        .pikachu .pikachu-contact-bar { display: flex; justify-content: center; gap: 10px; padding: 6px; background: #1f2937; }
                        .pikachu .pikachu-contact-bar span { width: 35px; height: 4px; background: rgba(255,255,255,0.5); }
                        .pikachu .pikachu-two-col { display: flex; padding: 8px; gap: 8px; }
                        .pikachu .pikachu-main { flex: 1; }
                        .pikachu .pikachu-section { margin-bottom: 8px; }
                        .pikachu .pikachu-section-title { width: 35%; height: 5px; background: #dc2626; margin-bottom: 6px; }
                        .pikachu .pikachu-line { height: 4px; background: #e5e7eb; margin-bottom: 3px; }
                        .pikachu .w-90 { width: 90%; }
                        .pikachu .w-80 { width: 80%; }
                        .pikachu .pikachu-side { width: 35%; background: #f9fafb; padding: 6px; border-radius: 4px; }
                        .pikachu .pikachu-side-section { margin-bottom: 6px; }
                        .pikachu .pikachu-side-title { width: 60%; height: 4px; background: #dc2626; margin-bottom: 6px; }
                        .pikachu .pikachu-tags { display: flex; flex-wrap: wrap; gap: 3px; }
                        .pikachu .pikachu-tags span { width: 22px; height: 6px; background: #dc2626; border-radius: 3px; }
                    `}</style>
                </div>
            );

        case 'onyx':
            return (
                <div className="layout-preview onyx">
                    {/* Horizontal header with indigo theme */}
                    <div className="onyx-header">
                        <div className="onyx-name"></div>
                        <div className="onyx-title"></div>
                        <div className="onyx-profiles-row">
                            <span></span><span></span><span></span><span></span>
                        </div>
                    </div>
                    <div className="onyx-body">
                        <div className="onyx-section">
                            <div className="onyx-section-title"></div>
                            <div className="onyx-content">
                                <div className="onyx-line w-95"></div>
                                <div className="onyx-line w-85"></div>
                            </div>
                        </div>
                        <div className="onyx-skills-section">
                            <div className="onyx-section-title"></div>
                            <div className="onyx-skills-grid">
                                <span></span><span></span><span></span><span></span>
                            </div>
                        </div>
                    </div>
                    <style jsx>{`
                        .onyx { background: white; height: 100%; }
                        .onyx .onyx-header { padding: 10px; border-bottom: 3px solid #6366f1; }
                        .onyx .onyx-name { width: 50%; height: 12px; background: #1f2937; margin-bottom: 4px; }
                        .onyx .onyx-title { width: 35%; height: 6px; background: #6366f1; margin-bottom: 8px; }
                        .onyx .onyx-profiles-row { display: flex; gap: 8px; }
                        .onyx .onyx-profiles-row span { width: 16px; height: 16px; background: rgba(99,102,241,0.1); border: 1px solid #6366f1; border-radius: 50%; }
                        .onyx .onyx-body { padding: 10px; }
                        .onyx .onyx-section { margin-bottom: 10px; }
                        .onyx .onyx-section-title { width: 25%; height: 5px; background: #6366f1; margin-bottom: 6px; }
                        .onyx .onyx-content { padding-left: 6px; border-left: 2px solid #e5e7eb; }
                        .onyx .onyx-line { height: 4px; background: #e5e7eb; margin-bottom: 3px; }
                        .onyx .w-95 { width: 95%; }
                        .onyx .w-85 { width: 85%; }
                        .onyx .onyx-skills-section { margin-bottom: 8px; }
                        .onyx .onyx-skills-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; }
                        .onyx .onyx-skills-grid span { height: 8px; background: rgba(99,102,241,0.15); border-radius: 2px; }
                    `}</style>
                </div>
            );

        case 'azurill':
            return (
                <div className="layout-preview azurill">
                    {/* Centered header with emerald theme */}
                    <div className="azurill-header">
                        <div className="azurill-name"></div>
                        <div className="azurill-title"></div>
                        <div className="azurill-contact">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                    <div className="azurill-divider"></div>
                    <div className="azurill-body">
                        <div className="azurill-section">
                            <div className="azurill-section-title"></div>
                            <div className="azurill-line w-90"></div>
                            <div className="azurill-line w-85"></div>
                        </div>
                        <div className="azurill-section">
                            <div className="azurill-section-title"></div>
                            <div className="azurill-chips">
                                <span></span><span></span><span></span><span></span>
                            </div>
                        </div>
                    </div>
                    <style jsx>{`
                        .azurill { background: white; height: 100%; }
                        .azurill .azurill-header { padding: 12px; text-align: center; }
                        .azurill .azurill-name { width: 55%; height: 12px; background: #1f2937; margin: 0 auto 4px; }
                        .azurill .azurill-title { width: 40%; height: 6px; background: #10b981; margin: 0 auto 8px; }
                        .azurill .azurill-contact { display: flex; justify-content: center; gap: 10px; }
                        .azurill .azurill-contact span { width: 35px; height: 4px; background: #9ca3af; }
                        .azurill .azurill-divider { height: 2px; background: linear-gradient(90deg, transparent, #10b981, transparent); margin: 0 12px; }
                        .azurill .azurill-body { padding: 10px 12px; }
                        .azurill .azurill-section { margin-bottom: 10px; }
                        .azurill .azurill-section-title { width: 28%; height: 5px; background: #10b981; margin-bottom: 6px; }
                        .azurill .azurill-line { height: 4px; background: #e5e7eb; margin-bottom: 3px; }
                        .azurill .w-90 { width: 90%; }
                        .azurill .w-85 { width: 85%; }
                        .azurill .azurill-chips { display: flex; flex-wrap: wrap; gap: 4px; }
                        .azurill .azurill-chips span { width: 28px; height: 10px; background: rgba(16,185,129,0.1); border: 1px solid #10b981; border-radius: 10px; }
                    `}</style>
                </div>
            );

        case 'bronzor':
            return (
                <div className="layout-preview bronzor">
                    {/* Dark sidebar with amber accent */}
                    <div className="bronzor-layout">
                        <div className="bronzor-sidebar">
                            <div className="bronzor-photo"></div>
                            <div className="bronzor-contact-list">
                                <span></span><span></span><span></span>
                            </div>
                            <div className="bronzor-skills">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                        <div className="bronzor-main">
                            <div className="bronzor-name"></div>
                            <div className="bronzor-title"></div>
                            <div className="bronzor-section">
                                <div className="bronzor-section-title"></div>
                                <div className="bronzor-line w-90"></div>
                                <div className="bronzor-line w-80"></div>
                            </div>
                            <div className="bronzor-section">
                                <div className="bronzor-section-title"></div>
                                <div className="bronzor-line w-85"></div>
                            </div>
                        </div>
                    </div>
                    <style jsx>{`
                        .bronzor { height: 100%; }
                        .bronzor .bronzor-layout { display: flex; height: 100%; }
                        .bronzor .bronzor-sidebar { width: 35%; background: #1e293b; padding: 10px; }
                        .bronzor .bronzor-photo { width: 30px; height: 30px; background: #f59e0b; border-radius: 50%; margin: 0 auto 10px; }
                        .bronzor .bronzor-contact-list { display: flex; flex-direction: column; gap: 4px; margin-bottom: 10px; }
                        .bronzor .bronzor-contact-list span { height: 4px; background: rgba(255,255,255,0.3); width: 80%; }
                        .bronzor .bronzor-skills { display: flex; flex-direction: column; gap: 4px; }
                        .bronzor .bronzor-skills span { height: 6px; background: #f59e0b; border-radius: 3px; width: 70%; }
                        .bronzor .bronzor-main { flex: 1; background: white; padding: 10px; }
                        .bronzor .bronzor-name { width: 60%; height: 10px; background: #1e293b; margin-bottom: 4px; }
                        .bronzor .bronzor-title { width: 45%; height: 5px; background: #f59e0b; margin-bottom: 10px; }
                        .bronzor .bronzor-section { margin-bottom: 8px; }
                        .bronzor .bronzor-section-title { width: 30%; height: 5px; background: #f59e0b; margin-bottom: 6px; }
                        .bronzor .bronzor-line { height: 4px; background: #e5e7eb; margin-bottom: 3px; }
                        .bronzor .w-90 { width: 90%; }
                        .bronzor .w-85 { width: 85%; }
                        .bronzor .w-80 { width: 80%; }
                    `}</style>
                </div>
            );

        default:
            return null;
    }
};

/**
 * Template Selector Component
 * Allows users to browse and select CV templates
 */
export default function TemplateSelector({ selectedTemplate, onSelectTemplate, showPreview = true }) {
    const templates = Object.values(TEMPLATE_INFO);
    const [hoveredTemplate, setHoveredTemplate] = useState(null);

    return (
        <div className="template-selector">
            <div className="template-header">
                <h3 className="template-title">
                    <Layout className="icon" />
                    Choose Your Template
                </h3>
                <p className="template-subtitle">
                    All templates are ATS-optimized for maximum compatibility
                </p>
            </div>

            <div className="templates-grid">
                {templates.map((template) => (
                    <div
                        key={template.id}
                        className={`template-card ${selectedTemplate === template.id ? 'selected' : ''}`}
                        onClick={() => onSelectTemplate(template.id)}
                        onMouseEnter={() => setHoveredTemplate(template.id)}
                        onMouseLeave={() => setHoveredTemplate(null)}
                    >
                        {/* Template Preview */}
                        <div className="template-preview">
                            <div className="preview-content">
                                <TemplateLayoutPreview templateId={template.id} />
                            </div>
                            
                            {/* Selection indicator */}
                            {selectedTemplate === template.id && (
                                <div className="selected-badge">
                                    <Check size={16} />
                                </div>
                            )}

                            {/* Hover overlay */}
                            {hoveredTemplate === template.id && selectedTemplate !== template.id && (
                                <div className="hover-overlay">
                                    <Eye size={24} />
                                    <span>Select Template</span>
                                </div>
                            )}
                        </div>

                        {/* Template Info */}
                        <div className="template-info">
                            <div className="template-name-row">
                                <h4 className="template-name">{template.name}</h4>
                                <div className="ats-score">
                                    <Star size={12} />
                                    <span>ATS Ready</span>
                                </div>
                            </div>
                            <p className="template-description">{template.description}</p>
                            <div className="template-best-for">
                                <span className="best-for-label">Best for:</span> {template.bestFor}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <style jsx>{`
                .template-selector {
                    padding: 20px 0;
                }

                .template-header {
                    margin-bottom: 24px;
                }

                .template-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #fff;
                    margin-bottom: 8px;
                }

                .template-title .icon {
                    color: var(--accent-color, #a855f7);
                }

                .template-subtitle {
                    font-size: 0.9rem;
                    color: #9ca3af;
                }

                .templates-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 20px;
                }

                .template-card {
                    background: rgba(255, 255, 255, 0.03);
                    border: 2px solid rgba(255, 255, 255, 0.08);
                    border-radius: 16px;
                    overflow: hidden;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .template-card:hover {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.15);
                    transform: translateY(-4px);
                }

                .template-card.selected {
                    border-color: var(--accent-color, #a855f7);
                    box-shadow: 0 0 30px rgba(168, 85, 247, 0.2);
                }

                .template-preview {
                    position: relative;
                    height: 200px;
                    padding: 12px;
                    overflow: hidden;
                    background: #1a1a2e;
                }

                .preview-content {
                    background: white;
                    border-radius: 6px;
                    height: 100%;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                }

                .layout-preview {
                    height: 100%;
                    overflow: hidden;
                }

                .selected-badge {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    width: 28px;
                    height: 28px;
                    background: var(--accent-color, #a855f7);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    z-index: 10;
                }

                .hover-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.6);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    color: white;
                    font-size: 0.9rem;
                    font-weight: 500;
                }

                .template-info {
                    padding: 16px;
                }

                .template-name-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }

                .template-name {
                    font-size: 1rem;
                    font-weight: 600;
                    color: #fff;
                }

                .ats-score {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 0.75rem;
                    color: #22c55e;
                    background: rgba(34, 197, 94, 0.1);
                    padding: 4px 8px;
                    border-radius: 12px;
                }

                .template-description {
                    font-size: 0.85rem;
                    color: #9ca3af;
                    margin-bottom: 8px;
                    line-height: 1.4;
                }

                .template-best-for {
                    font-size: 0.75rem;
                    color: #6b7280;
                }

                .best-for-label {
                    color: #9ca3af;
                    font-weight: 500;
                }

                @media (max-width: 768px) {
                    .templates-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
}
