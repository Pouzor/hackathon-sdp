from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.deps import CurrentAdmin, CurrentAstronaut
from src.db.session import get_db
from src.repositories.season import SeasonRepository
from src.repositories.trophy import TrophyRepository
from src.schemas.trophy import (
    TrophyAttributionCreate,
    TrophyAttributionOut,
    TrophyCreate,
    TrophyOut,
    TrophyUpdate,
)

router = APIRouter(prefix="/trophies", tags=["trophies"])


def _repo(db: AsyncSession = Depends(get_db)) -> TrophyRepository:
    return TrophyRepository(db)


def _season_repo(db: AsyncSession = Depends(get_db)) -> SeasonRepository:
    return SeasonRepository(db)


# ── Trophy CRUD (admin) ───────────────────────────────────────────────────────


@router.get("", response_model=list[TrophyOut])
async def list_trophies(repo: TrophyRepository = Depends(_repo)) -> list[TrophyOut]:
    trophies = await repo.get_all()
    return [TrophyOut.model_validate(t) for t in trophies]


@router.post("", response_model=TrophyOut, status_code=status.HTTP_201_CREATED)
async def create_trophy(
    body: TrophyCreate,
    _admin: CurrentAdmin,
    repo: TrophyRepository = Depends(_repo),
) -> TrophyOut:
    trophy = await repo.create(**body.model_dump())
    return TrophyOut.model_validate(trophy)


@router.patch("/{trophy_id}", response_model=TrophyOut)
async def update_trophy(
    trophy_id: int,
    body: TrophyUpdate,
    _admin: CurrentAdmin,
    repo: TrophyRepository = Depends(_repo),
) -> TrophyOut:
    trophy = await repo.get_by_id(trophy_id)
    if trophy is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trophée introuvable")
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    trophy = await repo.update(trophy, **updates)
    return TrophyOut.model_validate(trophy)


@router.delete("/{trophy_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_trophy(
    trophy_id: int,
    _admin: CurrentAdmin,
    repo: TrophyRepository = Depends(_repo),
) -> None:
    trophy = await repo.get_by_id(trophy_id)
    if trophy is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trophée introuvable")
    await repo.delete(trophy)


# ── Trophy attributions ───────────────────────────────────────────────────────


@router.get("/attributions", response_model=list[TrophyAttributionOut])
async def list_trophy_attributions(
    _user: CurrentAstronaut,
    astronaut_id: int | None = None,
    planet_id: int | None = None,
    repo: TrophyRepository = Depends(_repo),
) -> list[TrophyAttributionOut]:
    if astronaut_id is not None:
        attributions = await repo.get_attributions_by_astronaut(astronaut_id)
    elif planet_id is not None:
        attributions = await repo.get_attributions_by_planet(planet_id)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Paramètre astronaut_id ou planet_id requis.",
        )
    # Enrichissement trophy_name / trophy_icon_url
    results = []
    for attr in attributions:
        trophy = await repo.get_by_id(attr.trophy_id)
        out = TrophyAttributionOut.model_validate(attr)
        if trophy:
            out.trophy_name = trophy.name
            out.trophy_icon_url = trophy.icon_url
        results.append(out)
    return results


@router.post(
    "/attributions",
    response_model=TrophyAttributionOut,
    status_code=status.HTTP_201_CREATED,
)
async def create_trophy_attribution(
    body: TrophyAttributionCreate,
    admin: CurrentAdmin,
    repo: TrophyRepository = Depends(_repo),
    season_repo: SeasonRepository = Depends(_season_repo),
) -> TrophyAttributionOut:
    # Vérifier que le trophée existe
    trophy = await repo.get_by_id(body.trophy_id)
    if trophy is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Trophée introuvable"
        )

    # Saison active obligatoire
    season = await season_repo.get_active()
    if season is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Aucune saison active. Activez une saison avant d'attribuer un trophée.",
        )

    attribution = await repo.create_attribution(
        trophy_id=body.trophy_id,
        astronaut_id=body.astronaut_id,
        planet_id=body.planet_id,
        season_id=season.id,
        awarded_by=admin.id,
        comment=body.comment,
    )

    out = TrophyAttributionOut.model_validate(attribution)
    out.trophy_name = trophy.name
    out.trophy_icon_url = trophy.icon_url
    return out


@router.delete(
    "/attributions/{attribution_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_trophy_attribution(
    attribution_id: int,
    _admin: CurrentAdmin,
    repo: TrophyRepository = Depends(_repo),
) -> None:
    attribution = await repo.get_attribution_by_id(attribution_id)
    if attribution is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Attribution introuvable"
        )
    await repo.delete_attribution(attribution)
