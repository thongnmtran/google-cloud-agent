"""
Object Utils
"""


class Object:
    """
    Object Utils
    """
    @staticmethod
    def get(target, prop):
        try:
            return target[prop]
        except:
            try:
                return object.__getattribute__(target, prop)
            except:
                return None

    @staticmethod
    def assign(target, source):
        for key in source:
            setattr(target, key, source[key])
        return target

    @staticmethod
    def has(target, prop):
        try:
            target[prop]
            return True
        except:
            try:
                object.__getattribute__(target, prop)
                return True
            except:
                return False
