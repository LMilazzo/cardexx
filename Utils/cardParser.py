from pokemontcgsdk import Card

#Functions to help parse the Card class responses from the pokemontcgsdk


#Returns the core data as a python list
def extractCore(card):

    c = [
            card.id, 
            card.name, 
            card.rarity, 
            card.supertype, 
            card.set.id, 
            card.images.large, 
            card.images.small,
            serialize_card(card) #Json dump of the card
        ]


    return c

#Json dump into python serilization of class
#Recursively convert any Python object into JSON-serializable dicts/lists/primitives.
#Handles class instances, lists, dicts, and primitives.
def serialize_card(obj):

    # If it's a primitive type return
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