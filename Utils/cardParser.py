from pokemontcgsdk import Card

def extractCore(card):


    c = [
            card.id, 
            card.name, 
            card.rarity, 
            card.supertype, 
            card.set.id, 
            card.images.large, 
            card.images.small,
            serialize_card(card)
        ]


    return c


def serialize_card(obj):
    """
    Recursively convert any Python object into JSON-serializable dicts/lists/primitives.
    Handles class instances, lists, dicts, and primitives.
    """
    # If it's a primitive type, just return it
    if obj is None or isinstance(obj, (int, float, str, bool)):
        return obj

    # If it's a list/tuple, recursively serialize each item
    if isinstance(obj, (list, tuple)):
        return [serialize_card(o) for o in obj]

    # If it's a dict, recursively serialize values
    if isinstance(obj, dict):
        return {k: serialize_card(v) for k, v in obj.items()}

    # If it's a class instance with __dict__, recursively serialize its attributes
    if hasattr(obj, '__dict__'):
        return {k: serialize_card(v) for k, v in obj.__dict__.items()}

    # Fallback: convert anything else to string
    return str(obj)