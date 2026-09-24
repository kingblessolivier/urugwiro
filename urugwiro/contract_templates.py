"""
Sovereign Contract & Legal Document Templates for Urugwiro Platform.
Compliant with Rwandan statutory frameworks:
- Law N° 27/2021 Governing Land in Rwanda
- Law N° 15/2010 on Condominium & Co-ownership of Properties
- Law N° 001/2020 on Electronic Transactions & Digital Signatures in Rwanda
- Rwandan Matrimonial Regimes and Family Law
"""

import uuid
from datetime import datetime
from django.utils.timezone import now


def format_currency(amount, currency="RWF"):
    try:
        val = float(amount)
        return f"{val:,.0f} {currency}"
    except (ValueError, TypeError):
        return f"{amount} {currency}"


def generate_contract_html(contract_type, deal, custom_terms=None):
    """
    Renders formal, styled HTML for the requested contract type grounded
    in the TransactionDeal, Listing, Asset, Buyer, and Seller specs.
    """
    listing = deal.listing
    asset = getattr(listing, 'asset', None)
    buyer = deal.buyer_or_tenant
    seller = deal.seller_or_landlord
    agent = deal.assigned_agent

    buyer_name = getattr(buyer, 'get_full_name', lambda: '')() or getattr(buyer, 'username', 'Prospective Buyer')
    buyer_phone = getattr(buyer, 'phone_number', '+250 788 000 000') if hasattr(buyer, 'phone_number') else '+250 788 000 000'
    buyer_email = getattr(buyer, 'email', '') or 'buyer@urugwiro.rw'
    buyer_id = getattr(buyer, 'national_id', '1 1990 8 0000000 0 00') if hasattr(buyer, 'national_id') else '1 1990 8 0000000 0 00'

    seller_name = getattr(seller, 'name', 'Verified Asset Owner') if seller else 'Verified Asset Owner'
    seller_phone = getattr(seller, 'phone_number', '+250 788 111 222') if seller else '+250 788 111 222'
    seller_email = getattr(seller, 'email', '') if seller else 'owner@urugwiro.rw'

    agent_name = getattr(agent, 'name', 'Accredited Platform Broker') if agent else 'Urugwiro Sovereign Registry'
    agent_phone = getattr(agent, 'phone_number', '+250 788 333 444') if agent else '+250 788 333 444'
    agent_license = getattr(agent, 'license_number', 'RDB-REA-2024-8841') if agent else 'RDB-REA-2024-8841'

    price_str = format_currency(deal.agreed_price, deal.currency)
    deposit_str = format_currency(deal.escrow_deposit_amount, deal.currency)
    date_str = now().strftime('%d %B %Y')
    upi = deal.land_upi or (getattr(getattr(asset, 'land_spec', None), 'upi_number', '1/02/11/04/1820') if asset else '1/02/11/04/1820')
    district = getattr(asset, 'district', 'Gasabo') if asset else 'Gasabo'
    sector = getattr(asset, 'sector', 'Nyarutarama') if asset else 'Nyarutarama'
    province = getattr(asset, 'province', 'Kigali City') if asset else 'Kigali City'

    if contract_type == 'property_sale':
        return _render_property_sale(
            deal=deal, listing=listing, asset=asset, price_str=price_str, deposit_str=deposit_str,
            date_str=date_str, upi=upi, province=province, district=district, sector=sector,
            buyer_name=buyer_name, buyer_phone=buyer_phone, buyer_email=buyer_email, buyer_id=buyer_id,
            seller_name=seller_name, seller_phone=seller_phone, seller_email=seller_email,
            agent_name=agent_name, agent_phone=agent_phone, agent_license=agent_license,
            custom_terms=custom_terms
        )
    elif contract_type == 'apartment_unit_sale':
        return _render_apartment_unit_sale(
            deal=deal, listing=listing, asset=asset, price_str=price_str, deposit_str=deposit_str,
            date_str=date_str, upi=upi, province=province, district=district, sector=sector,
            buyer_name=buyer_name, buyer_phone=buyer_phone, buyer_email=buyer_email, buyer_id=buyer_id,
            seller_name=seller_name, seller_phone=seller_phone, seller_email=seller_email,
            agent_name=agent_name, agent_phone=agent_phone, agent_license=agent_license,
            custom_terms=custom_terms
        )
    elif contract_type == 'land_sale':
        return _render_land_sale(
            deal=deal, listing=listing, asset=asset, price_str=price_str, deposit_str=deposit_str,
            date_str=date_str, upi=upi, province=province, district=district, sector=sector,
            buyer_name=buyer_name, buyer_phone=buyer_phone, buyer_email=buyer_email, buyer_id=buyer_id,
            seller_name=seller_name, seller_phone=seller_phone, seller_email=seller_email,
            agent_name=agent_name, agent_phone=agent_phone, agent_license=agent_license,
            custom_terms=custom_terms
        )
    elif contract_type in ['residential_lease', 'commercial_lease']:
        return _render_lease_agreement(
            deal=deal, listing=listing, asset=asset, price_str=price_str, deposit_str=deposit_str,
            date_str=date_str, upi=upi, province=province, district=district, sector=sector,
            buyer_name=buyer_name, buyer_phone=buyer_phone, buyer_email=buyer_email, buyer_id=buyer_id,
            seller_name=seller_name, seller_phone=seller_phone, seller_email=seller_email,
            agent_name=agent_name, agent_phone=agent_phone, agent_license=agent_license,
            is_commercial=(contract_type == 'commercial_lease'),
            custom_terms=custom_terms
        )
    elif contract_type == 'vehicle_sale':
        return _render_vehicle_sale(
            deal=deal, listing=listing, asset=asset, price_str=price_str, deposit_str=deposit_str,
            date_str=date_str, buyer_name=buyer_name, buyer_phone=buyer_phone, buyer_id=buyer_id,
            seller_name=seller_name, seller_phone=seller_phone,
            agent_name=agent_name, custom_terms=custom_terms
        )
    elif contract_type == 'spousal_consent':
        return _render_spousal_consent(
            deal=deal, listing=listing, upi=upi, price_str=price_str, date_str=date_str,
            seller_name=seller_name, buyer_name=buyer_name, district=district
        )
    elif contract_type == 'handover_protocol':
        return _render_handover_protocol(
            deal=deal, listing=listing, date_str=date_str,
            buyer_name=buyer_name, seller_name=seller_name, agent_name=agent_name
        )
    else:
        return f"<h3>Agreement for Deal {deal.id}</h3><p>Price: {price_str}</p>"


# ─── 1. Property Sale Agreement (Compromis de Vente) ───

def _render_property_sale(deal, listing, asset, price_str, deposit_str, date_str, upi, province, district, sector,
                          buyer_name, buyer_phone, buyer_email, buyer_id, seller_name, seller_phone, seller_email,
                          agent_name, agent_phone, agent_license, custom_terms):
    res_spec = getattr(asset, 'residential_spec', None)
    bedrooms = getattr(res_spec, 'bedrooms', 4) if res_spec else 4
    bathrooms = getattr(res_spec, 'bathrooms', 3) if res_spec else 3
    area = getattr(asset, 'total_area', 450) if asset else 450

    return f"""
    <div class="legal-contract-doc space-y-6 text-zinc-800 dark:text-zinc-200">
        <div class="text-center border-b pb-6 border-zinc-200 dark:border-white/10">
            <span class="text-[11px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block mb-1">
                REPUBLIC OF RWANDA • SOVEREIGN CONVEYANCE
            </span>
            <h1 class="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                BILATERAL REAL ESTATE PURCHASE & SALE AGREEMENT
            </h1>
            <p class="text-xs text-zinc-500 font-mono mt-1">
                AMASEZERANO YO KUGURISHA NO KUGURA INZU • REF #{str(deal.id)[:8].upper()}
            </p>
            <div class="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                <span>Governed by Law N° 27/2021 on Land in Rwanda</span>
            </div>
        </div>

        <div class="p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5 space-y-3">
            <h3 class="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Preamble & Contracting Parties</h3>
            <p class="text-xs leading-relaxed">
                This Agreement is executed on this <strong>{date_str}</strong> by and between:
            </p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                <div class="p-3 rounded-xl bg-white dark:bg-white/[0.02] border border-zinc-200/80 dark:border-white/5">
                    <span class="font-bold block text-zinc-900 dark:text-white mb-1">THE SELLER (Umugurisha):</span>
                    <p><strong>Name:</strong> {seller_name}</p>
                    <p><strong>Phone:</strong> {seller_phone}</p>
                    <p><strong>Email:</strong> {seller_email}</p>
                    <p><strong>Legal Status:</strong> Verified Registered Owner</p>
                </div>
                <div class="p-3 rounded-xl bg-white dark:bg-white/[0.02] border border-zinc-200/80 dark:border-white/5">
                    <span class="font-bold block text-zinc-900 dark:text-white mb-1">THE BUYER (Umuguzi):</span>
                    <p><strong>Name:</strong> {buyer_name}</p>
                    <p><strong>NIDA / Passport:</strong> {buyer_id}</p>
                    <p><strong>Phone:</strong> {buyer_phone}</p>
                    <p><strong>Email:</strong> {buyer_email}</p>
                </div>
            </div>
            <p class="text-[11px] text-zinc-500 pt-1">
                Facilitated by Certified Real Estate Broker: <strong>{agent_name}</strong> (License: <code>{agent_license}</code>, Tel: {agent_phone}).
            </p>
        </div>

        <div class="space-y-4 text-xs leading-relaxed">
            <div>
                <h4 class="font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-1">Article 1: Object of Sale & Cadastral Identification</h4>
                <p>
                    The Seller hereby agrees to convey, transfer, and sell to the Buyer, who accepts, the real property designated as:
                    <br/>
                    <strong>Asset Title:</strong> {listing.title}
                    <br/>
                    <strong>Cadastral UPI Number:</strong> <span class="font-mono font-bold text-emerald-600 dark:text-emerald-400">{upi}</span>
                    <br/>
                    <strong>Administrative Location:</strong> {province}, {district} District, {sector} Sector
                    <br/>
                    <strong>Specifications:</strong> {bedrooms} Ensuite Bedrooms, {bathrooms} Bathrooms, Built-Up & Compound Area: approx. {area} m².
                </p>
            </div>

            <div>
                <h4 class="font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-1">Article 2: Purchase Price & Escrow Financial Terms</h4>
                <p>
                    The total agreed purchase price is strictly established at 
                    <strong class="font-mono text-emerald-600 dark:text-emerald-400">{price_str}</strong>.
                </p>
                <ul class="list-disc pl-5 mt-1.5 space-y-1">
                    <li>
                        <strong>Earnest Escrow Deposit:</strong> An earnest deposit of <strong>{deposit_str}</strong> (approx. {getattr(deal.offer, 'escrow_proposed_percent', 10)}% of total price) 
                        shall be deposited into the BNR-regulated platform tripartite escrow vault within three (3) business days of signing.
                    </li>
                    <li>
                        <strong>Balance of Payment:</strong> The remaining balance shall be disbursed upon formal signing of the Authenticated Deed before the District Land Notary.
                    </li>
                </ul>
            </div>

            <div>
                <h4 class="font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-1">Article 3: Title Search, Caveat Check & Encumbrance Free Guarantee</h4>
                <p>
                    The Seller warrants and covenants that the parcel registered under UPI <code>{upi}</code> is entirely free of any registered mortgages, 
                    bank liens, legal caveats, judicial attachments, or unregistered claims at the Rwanda Land Management and Use Authority (RLMUA). 
                    The Buyer retains seven (7) business days to verify cadastral title clearance.
                </p>
            </div>

            <div>
                <h4 class="font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-1">Article 4: IremboGov Notary Conveyance & Official Title Transfer</h4>
                <p>
                    Both parties commit to collaborating promptly on the official transfer via the <strong>IremboGov Land Transfer Service</strong>. 
                    The Seller shall present original Land Title deeds, National IDs, and formal Spousal Consent if married under community property. 
                    Transfer taxes and notary duties shall be allocated according to statutory laws of Rwanda.
                </p>
            </div>

            <div>
                <h4 class="font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-1">Article 5: Legal Jurisdiction & Electronic Execution</h4>
                <p>
                    This contract is signed pursuant to Law N° 001/2020 on Electronic Transactions. 
                    Digital signatures, biometric canvas marks, and SMS OTP timestamps appended hereto carry full legal validity under Rwandan jurisprudence. 
                    Any disputes arising hereunder shall fall under the exclusive jurisdiction of the Commercial Court of Kigali.
                </p>
            </div>

            {f'<div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 font-medium"><strong>Special Deal Covenants:</strong> {custom_terms}</div>' if custom_terms else ''}
        </div>
    </div>
    """


# ─── 2. Condominium / Apartment Unit Purchase Agreement ───

def _render_apartment_unit_sale(deal, listing, asset, price_str, deposit_str, date_str, upi, province, district, sector,
                                buyer_name, buyer_phone, buyer_email, buyer_id, seller_name, seller_phone, seller_email,
                                agent_name, agent_phone, agent_license, custom_terms):
    res_spec = getattr(asset, 'residential_spec', None)
    unit_no = getattr(res_spec, 'unit_number', 'Unit 302') if res_spec else 'Unit 302'
    floor_no = getattr(res_spec, 'floor_number', 3) if res_spec else 3
    parking = getattr(res_spec, 'parking_slot_number', 'Bay P-12') if res_spec else 'Bay P-12'
    hoa = getattr(res_spec, 'monthly_service_charge', 65000) if res_spec else 65000
    orientation = getattr(res_spec, 'unit_orientation', 'City Skyline View') if res_spec else 'City Skyline View'

    return f"""
    <div class="legal-contract-doc space-y-6 text-zinc-800 dark:text-zinc-200">
        <div class="text-center border-b pb-6 border-zinc-200 dark:border-white/10">
            <span class="text-[11px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block mb-1">
                REPUBLIC OF RWANDA • CO-OWNERSHIP DEED
            </span>
            <h1 class="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                CONDOMINIUM APARTMENT UNIT PURCHASE AGREEMENT
            </h1>
            <p class="text-xs text-zinc-500 font-mono mt-1">
                AMASEZERANO YO KUGURA INZU Y'ABAFATANYIJE • REF #{str(deal.id)[:8].upper()}
            </p>
            <div class="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                <span>Governed by Law N° 15/2010 on Condominium Properties</span>
            </div>
        </div>

        <div class="space-y-4 text-xs leading-relaxed">
            <div class="p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5 space-y-2">
                <h4 class="font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Unit Specifications & Allocated Common Shares</h4>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center pt-2">
                    <div class="p-2 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/5">
                        <span class="text-[10px] text-zinc-400 block">Unit Designated</span>
                        <strong class="text-emerald-600 dark:text-emerald-400 font-mono text-sm">{unit_no}</strong>
                    </div>
                    <div class="p-2 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/5">
                        <span class="text-[10px] text-zinc-400 block">Floor Level</span>
                        <strong class="text-zinc-900 dark:text-white font-mono text-sm">Floor {floor_no}</strong>
                    </div>
                    <div class="p-2 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/5">
                        <span class="text-[10px] text-zinc-400 block">Allocated Parking</span>
                        <strong class="text-zinc-900 dark:text-white font-mono text-sm">{parking}</strong>
                    </div>
                    <div class="p-2 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/5">
                        <span class="text-[10px] text-zinc-400 block">Monthly HOA Fee</span>
                        <strong class="text-emerald-600 dark:text-emerald-400 font-mono text-sm">{format_currency(hoa)}</strong>
                    </div>
                </div>
                <p class="text-[11px] text-zinc-500 pt-2">
                    <strong>Orientation & View:</strong> {orientation} • <strong>Building Master UPI:</strong> <code>{upi}</code> ({district}, {sector})
                </p>
            </div>

            <div>
                <h4 class="font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-1">Article 1: Private Ownership & Undivided Common Property</h4>
                <p>
                    The Buyer acquires exclusive private freehold/leasehold title to <strong>{unit_no}</strong>, alongside an undivided fractional co-ownership 
                    interest in the structural foundations, high-speed elevators, communal corridors, rooftop terrace, security gates, and landscaping.
                </p>
            </div>

            <div>
                <h4 class="font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-1">Article 2: Purchase Price & Escrow Staging</h4>
                <p>
                    The agreed purchase consideration is <strong class="font-mono text-emerald-600 dark:text-emerald-400">{price_str}</strong>. 
                    An escrow deposit of <strong>{deposit_str}</strong> is retained in sovereign tripartite custody until the Master Deed fractional allocation 
                    is registered in the Buyer's name at the Land Registry.
                </p>
            </div>

            <div>
                <h4 class="font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-1">Article 3: Condominium Bylaws & Association Membership</h4>
                <p>
                    The Buyer covenants to adhere unconditionally to the Condominium Internal Regulations (*Amategeko y'Abafatanyije*) 
                    and to disburse the monthly HOA service charge of {format_currency(hoa)} for 24/7 security, backup generator diesel reserves, and common area upkeep.
                </p>
            </div>
        </div>
    </div>
    """


# ─── 3. Land Conveyance Agreement ───

def _render_land_sale(deal, listing, asset, price_str, deposit_str, date_str, upi, province, district, sector,
                      buyer_name, buyer_phone, buyer_email, buyer_id, seller_name, seller_phone, seller_email,
                      agent_name, agent_phone, agent_license, custom_terms):
    land_spec = getattr(asset, 'land_spec', None)
    zoning = getattr(land_spec, 'zoning_code', 'R2') if land_spec else 'R2'
    tenure = getattr(land_spec, 'tenure_type', 'Emphyteutic Lease') if land_spec else 'Emphyteutic Lease'
    lease_years = getattr(land_spec, 'lease_years_remaining', 49) if land_spec else 49

    return f"""
    <div class="legal-contract-doc space-y-6 text-zinc-800 dark:text-zinc-200">
        <div class="text-center border-b pb-6 border-zinc-200 dark:border-white/10">
            <span class="text-[11px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block mb-1">
                RWANDA LAND MANAGEMENT & USE AUTHORITY (RLMUA)
            </span>
            <h1 class="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                BILATERAL LAND CONVEYANCE & TITLE TRANSFER CONTRACT
            </h1>
            <p class="text-xs text-zinc-500 font-mono mt-1">
                AMASEZERANO YO GUHEREREKANYA UBUTAKA • REF #{str(deal.id)[:8].upper()}
            </p>
        </div>

        <div class="space-y-4 text-xs leading-relaxed">
            <div class="p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5 space-y-2">
                <h4 class="font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Cadastral Registry Telemetry</h4>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center pt-2">
                    <div class="p-2 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/5">
                        <span class="text-[10px] text-zinc-400 block">Cadastre UPI</span>
                        <strong class="text-emerald-600 dark:text-emerald-400 font-mono text-sm">{upi}</strong>
                    </div>
                    <div class="p-2 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/5">
                        <span class="text-[10px] text-zinc-400 block">Master Plan 2050 Zoning</span>
                        <strong class="text-zinc-900 dark:text-white font-mono text-sm">{zoning}</strong>
                    </div>
                    <div class="p-2 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/5">
                        <span class="text-[10px] text-zinc-400 block">Tenure Regime</span>
                        <strong class="text-zinc-900 dark:text-white text-xs">{tenure}</strong>
                    </div>
                    <div class="p-2 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/5">
                        <span class="text-[10px] text-zinc-400 block">Remaining Lease</span>
                        <strong class="text-emerald-600 dark:text-emerald-400 font-mono text-sm">{lease_years} Years</strong>
                    </div>
                </div>
            </div>

            <div>
                <h4 class="font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-1">Article 1: Cadastral Boundaries & Topographical Guarantee</h4>
                <p>
                    The Seller warrants that the cadastral coordinates, boundary beacons, and boundary vertices registered under UPI <code>{upi}</code> 
                    are completely verified by licensed surveyors and confirmed outside any municipal wetland buffer zones or public road reserves.
                </p>
            </div>

            <div>
                <h4 class="font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-1">Article 2: Consideration & Escrow Release</h4>
                <p>
                    Agreed land purchase amount: <strong class="font-mono text-emerald-600 dark:text-emerald-400">{price_str}</strong>. 
                    Escrow deposit of <strong>{deposit_str}</strong> is released only upon confirmation of Irembo filing receipt and biometric notarial consent.
                </p>
            </div>
        </div>
    </div>
    """


# ─── 4. Tenancy Lease Agreement (Residential / Commercial) ───

def _render_lease_agreement(deal, listing, asset, price_str, deposit_str, date_str, upi, province, district, sector,
                            buyer_name, buyer_phone, buyer_email, buyer_id, seller_name, seller_phone, seller_email,
                            agent_name, agent_phone, agent_license, is_commercial, custom_terms):
    title = "COMMERCIAL PROPERTY LEASE AGREEMENT" if is_commercial else "STANDARD RESIDENTIAL TENANCY AGREEMENT"
    kinya = "AMASEZERANO Y'UBUKODE BW'UBUCURUZI" if is_commercial else "AMASEZERANO Y'UBUKODE BWO GUTURAMO"

    return f"""
    <div class="legal-contract-doc space-y-6 text-zinc-800 dark:text-zinc-200">
        <div class="text-center border-b pb-6 border-zinc-200 dark:border-white/10">
            <span class="text-[11px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block mb-1">
                URUGWIRO REAL ESTATE MANAGEMENT • TENANCY REGISTRATION
            </span>
            <h1 class="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                {title}
            </h1>
            <p class="text-xs text-zinc-500 font-mono mt-1">
                {kinya} • REF #{str(deal.id)[:8].upper()}
            </p>
        </div>

        <div class="space-y-4 text-xs leading-relaxed">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="p-3.5 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5">
                    <span class="font-bold text-zinc-900 dark:text-white block mb-1">THE LANDLORD (Nyir'Inzu):</span>
                    <p><strong>Name:</strong> {seller_name}</p>
                    <p><strong>Phone:</strong> {seller_phone}</p>
                    <p><strong>Email:</strong> {seller_email}</p>
                </div>
                <div class="p-3.5 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5">
                    <span class="font-bold text-zinc-900 dark:text-white block mb-1">THE TENANT (Umukode):</span>
                    <p><strong>Name:</strong> {buyer_name}</p>
                    <p><strong>NIDA / Passport:</strong> {buyer_id}</p>
                    <p><strong>Phone:</strong> {buyer_phone}</p>
                    <p><strong>Email:</strong> {buyer_email}</p>
                </div>
            </div>

            <div>
                <h4 class="font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-1">Article 1: Rent Consideration & Security Deposit</h4>
                <p>
                    The agreed monthly rent is establish at <strong class="font-mono text-emerald-600 dark:text-emerald-400">{price_str} per month</strong>, 
                    payable in advance by the 5th calendar day of each cycle. 
                    A refundable security deposit of <strong>{deposit_str}</strong> shall remain held in safe custody to cover verified damages or outstanding utility balances.
                </p>
            </div>

            <div>
                <h4 class="font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-1">Article 2: Inventory & Inspection (État des Lieux)</h4>
                <p>
                    The parties shall jointly execute an official move-in inventory report (*Procès-Verbal d'État des Lieux*) 
                    verifying the baseline condition of electrical fixtures, sanitary ware, EUCL Cashpower meter balances, and WASAC meters.
                </p>
            </div>

            <div>
                <h4 class="font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-1">Article 3: Maintenance & Utility Responsibilities</h4>
                <p>
                    The Tenant shall bear routine domestic utilities (EUCL electricity cashpower, WASAC water consumption, internet subscription). 
                    The Landlord remains strictly liable for structural repairs, roofing, perimeter integrity, and public property taxes.
                </p>
            </div>
        </div>
    </div>
    """


# ─── 5. Motor Vehicle Bill of Sale ───

def _render_vehicle_sale(deal, listing, asset, price_str, deposit_str, date_str,
                         buyer_name, buyer_phone, buyer_id, seller_name, seller_phone,
                         agent_name, custom_terms):
    veh_spec = getattr(asset, 'vehicle_spec', None)
    make = getattr(veh_spec, 'make', 'Toyota') if veh_spec else 'Toyota'
    model = getattr(veh_spec, 'model', 'Land Cruiser Prado') if veh_spec else 'Land Cruiser Prado'
    year = getattr(veh_spec, 'year', 2022) if veh_spec else 2022
    plate = getattr(veh_spec, 'plate_number', 'RAD 450 K') if veh_spec else 'RAD 450 K'
    vin = getattr(veh_spec, 'vin_chassis_number', 'JTEBX21J0K0091823') if veh_spec else 'JTEBX21J0K0091823'
    mileage = getattr(veh_spec, 'mileage', 48500) if veh_spec else 48500

    return f"""
    <div class="legal-contract-doc space-y-6 text-zinc-800 dark:text-zinc-200">
        <div class="text-center border-b pb-6 border-zinc-200 dark:border-white/10">
            <span class="text-[11px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block mb-1">
                RWANDA REVENUE AUTHORITY (RRA) • MOTOR VEHICLE DIVISION
            </span>
            <h1 class="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                BILATERAL MOTOR VEHICLE BILL OF SALE & OWNERSHIP TRANSFER
            </h1>
            <p class="text-xs text-zinc-500 font-mono mt-1">
                AMASEZERANO YO KUGURISHA IMODOKA • REF #{str(deal.id)[:8].upper()}
            </p>
        </div>

        <div class="space-y-4 text-xs leading-relaxed">
            <div class="p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5 space-y-2">
                <h4 class="font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Vehicle Technical Telemetry</h4>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center pt-2">
                    <div class="p-2 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/5">
                        <span class="text-[10px] text-zinc-400 block">Plate Number</span>
                        <strong class="text-emerald-600 dark:text-emerald-400 font-mono text-sm">{plate}</strong>
                    </div>
                    <div class="p-2 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/5">
                        <span class="text-[10px] text-zinc-400 block">Make & Model</span>
                        <strong class="text-zinc-900 dark:text-white text-xs">{year} {make} {model}</strong>
                    </div>
                    <div class="p-2 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/5">
                        <span class="text-[10px] text-zinc-400 block">VIN / Chassis</span>
                        <strong class="text-zinc-900 dark:text-white font-mono text-[11px] truncate block">{vin}</strong>
                    </div>
                    <div class="p-2 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/5">
                        <span class="text-[10px] text-zinc-400 block">Odometer Reading</span>
                        <strong class="text-emerald-600 dark:text-emerald-400 font-mono text-sm">{mileage:,} km</strong>
                    </div>
                </div>
            </div>

            <div>
                <h4 class="font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-1">Article 1: Consideration & Carte Jaune Delivery</h4>
                <p>
                    The agreed purchase consideration is <strong class="font-mono text-emerald-600 dark:text-emerald-400">{price_str}</strong>. 
                    The Seller covenants to deliver the genuine original Logbook (*Carte Jaune*), valid Police Contrôle Technique certificate, 
                    and two (2) sets of functional vehicle keys upon payment confirmation.
                </p>
            </div>

            <div>
                <h4 class="font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-1">Article 2: RRA Motor Vehicle Transfer Duties</h4>
                <p>
                    The parties agree to execute the statutory RRA ownership transfer within seven (7) business days. 
                    The Seller guarantees that all historical traffic fines, radar penalties, and road fund taxes up to this date are fully liquidated.
                </p>
            </div>
        </div>
    </div>
    """


# ─── 6. Spousal Consent Affidavit ───

def _render_spousal_consent(deal, listing, upi, price_str, date_str, seller_name, buyer_name, district):
    return f"""
    <div class="legal-contract-doc space-y-6 text-zinc-800 dark:text-zinc-200">
        <div class="text-center border-b pb-6 border-zinc-200 dark:border-white/10">
            <span class="text-[11px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block mb-1">
                RWANDAN MATRIMONIAL REGIMES COMPLIANCE • LAW N° 27/2016
            </span>
            <h1 class="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                SPOUSAL CONSENT AFFIDAVIT FOR PROPERTY CONVEYANCE
            </h1>
            <p class="text-xs text-zinc-500 font-mono mt-1">
                INYANDIKO Y'UBURENGANZIRA BW'UWASHAKANYE • REF #{str(deal.id)[:8].upper()}
            </p>
        </div>

        <div class="space-y-4 text-xs leading-relaxed">
            <p>
                I, the undersigned spouse of <strong>{seller_name}</strong>, legally married under the civil regime of 
                <strong>Community of Property (*Umutungo Rusange*)</strong>, hereby declare under oath:
            </p>
            <ul class="list-disc pl-5 space-y-1.5">
                <li>I have been fully briefed on and unreservedly approve the sale of our real estate asset registered under UPI <strong>{upi}</strong> in {district} District.</li>
                <li>I approve the agreed transaction consideration of <strong>{price_str}</strong> conveyed to the Buyer <strong>{buyer_name}</strong>.</li>
                <li>I affirm that no matrimonial dispute or pending division proceedings affect this property.</li>
                <li>I grant full consent for the digital conveyance and notarial deed execution at the District Land Bureau.</li>
            </ul>
        </div>
    </div>
    """


# ─── 7. Inspection & Key Handover Protocol ───

def _render_handover_protocol(deal, listing, date_str, buyer_name, seller_name, agent_name):
    return f"""
    <div class="legal-contract-doc space-y-6 text-zinc-800 dark:text-zinc-200">
        <div class="text-center border-b pb-6 border-zinc-200 dark:border-white/10">
            <span class="text-[11px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block mb-1">
                URUGWIRO CLOSING DESK • PROPERTY HANDOVER
            </span>
            <h1 class="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                KEY HANDOVER & CONDITION INSPECTION PROTOCOL
            </h1>
            <p class="text-xs text-zinc-500 font-mono mt-1">
                PROCÈS-VERBAL DE REMISE DES CLÉS ET ÉTAT DES LIEUX • REF #{str(deal.id)[:8].upper()}
            </p>
        </div>

        <div class="space-y-4 text-xs leading-relaxed">
            <p>
                Conducted on <strong>{date_str}</strong> at the premises of <strong>{listing.title}</strong>, 
                in the presence of the Seller ({seller_name}), Buyer/Tenant ({buyer_name}), and Certified Broker ({agent_name}).
            </p>

            <div class="p-3.5 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5 space-y-2">
                <h4 class="font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Utility Meters Baseline Reading</h4>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div class="p-2 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/5">
                        <span class="text-[10px] text-zinc-400 block">EUCL Cashpower Meter</span>
                        <strong class="text-zinc-900 dark:text-white font-mono text-xs">Meter #0412-9982-120</strong>
                        <span class="text-[10px] text-emerald-500 block">Balance: 124.5 kWh</span>
                    </div>
                    <div class="p-2 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/5">
                        <span class="text-[10px] text-zinc-400 block">WASAC Water Meter</span>
                        <strong class="text-zinc-900 dark:text-white font-mono text-xs">Index #W-88192-KGL</strong>
                        <span class="text-[10px] text-emerald-500 block">Reading: 0142 m³</span>
                    </div>
                    <div class="p-2 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/5">
                        <span class="text-[10px] text-zinc-400 block">Access Hardware Handed</span>
                        <strong class="text-zinc-900 dark:text-white text-xs">3 Gate Keys + 2 Remotes</strong>
                    </div>
                </div>
            </div>

            <p>
                The Buyer/Tenant confirms physical satisfaction with the premises and assumes full possession.
            </p>
        </div>
    </div>
    """
