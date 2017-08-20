<?php

/* index/index.php.html */
class __TwigTemplate_25a59542138a7774fdd4f6dc112b103ce0e2f0da3792dac694026fdc4a9b676e extends Twig_Template
{
    public function __construct(Twig_Environment $env)
    {
        parent::__construct($env);

        $this->parent = false;

        $this->blocks = array(
        );
    }

    protected function doDisplay(array $context, array $blocks = array())
    {
        // line 1
        echo "<?php
  echo \"hello world\";
?>

hello
";
    }

    public function getTemplateName()
    {
        return "index/index.php.html";
    }

    public function getDebugInfo()
    {
        return array (  19 => 1,);
    }

    /** @deprecated since 1.27 (to be removed in 2.0). Use getSourceContext() instead */
    public function getSource()
    {
        @trigger_error('The '.__METHOD__.' method is deprecated since version 1.27 and will be removed in 2.0. Use getSourceContext() instead.', E_USER_DEPRECATED);

        return $this->getSourceContext()->getCode();
    }

    public function getSourceContext()
    {
        return new Twig_Source("", "index/index.php.html", "D:\\install\\cygwin\\data\\wwwroot\\smallApi\\view\\index\\index.php.html");
    }
}
